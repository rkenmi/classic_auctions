/*
 * Copyright 2015 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.rkenmi.classicah.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.rkenmi.classicah.document.Item;
import com.rkenmi.classicah.model.Marketprice;
import com.rkenmi.classicah.model.MetaItem;
import com.rkenmi.classicah.repositories.DailyMarketpriceRepository;
import com.rkenmi.classicah.repositories.HourlyMarketpriceRepository;
import com.rkenmi.classicah.service.MetaItemService;
import lombok.extern.log4j.Log4j2;
import org.elasticsearch.ElasticsearchStatusException;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.ResponseException;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.client.core.CountRequest;
import org.elasticsearch.client.core.CountResponse;
import org.elasticsearch.common.unit.TimeValue;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.search.sort.FieldSortBuilder;
import org.elasticsearch.search.sort.SortBuilders;
import org.elasticsearch.search.sort.SortOrder;
import org.elasticsearch.search.suggest.Suggest;
import org.elasticsearch.search.suggest.SuggestBuilder;
import org.elasticsearch.search.suggest.SuggestBuilders;
import org.elasticsearch.search.suggest.SuggestionBuilder;
import org.elasticsearch.search.suggest.completion.CompletionSuggestion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TimeZone;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import static com.rkenmi.classicah.data.SupportedRealms.US_WEST;

/**
 * @author Rick Miyamoto
 */
@Log4j2
@RestController
public class SearchController {
    private RestHighLevelClient client;
    private ObjectMapper objectMapper = new ObjectMapper();
    private MetaItemService metaItemService;
    private HourlyMarketpriceRepository hourlyMarketpriceRepository;
    private DailyMarketpriceRepository dailyMarketpriceRepository;

    private final static Set<String> SUPPORTED_FACTIONS = ImmutableSet.of("horde", "alliance");
	private final static Set<String> SUPPORTED_REALMS = new HashSet<>(
			US_WEST.stream().map(String::toLowerCase).collect(Collectors.toList())
	);
	private final static Set<String> SUPPORTED_FIELDS = ImmutableSet.of(
			"quantity", "bid", "buyout"
	);

	@Autowired
    public SearchController(RestHighLevelClient client, MetaItemService metaItemService,
							DailyMarketpriceRepository dailyMarketpriceRepository,
							HourlyMarketpriceRepository hourlyMarketpriceRepository) {
    	this.client = client;
    	this.metaItemService = metaItemService;
		this.hourlyMarketpriceRepository = hourlyMarketpriceRepository;
		this.dailyMarketpriceRepository = dailyMarketpriceRepository;
	}

	private String normalizeQuery(final String q) {
		return q.replaceAll("[\\\\/:*?\"<>|{}\\[\\]]", "");
	}

	public static Calendar convertToGmt(Calendar cal) {

		Date date = cal.getTime();
		TimeZone tz = cal.getTimeZone();

		log.debug("input calendar has date [" + date + "]");

		//Returns the number of milliseconds since January 1, 1970, 00:00:00 GMT
		long msFromEpochGmt = date.getTime();

		//gives you the current offset in ms from GMT at the current date
		int offsetFromUTC = tz.getOffset(msFromEpochGmt);
		log.debug("offset is " + offsetFromUTC);

		//create a new calendar in GMT timezone, set to this date and add the offset
		Calendar gmtCal = Calendar.getInstance(TimeZone.getTimeZone("GMT"));
		gmtCal.setTime(date);
		gmtCal.add(Calendar.MILLISECOND, offsetFromUTC);

		log.debug("Created GMT cal with date [" + gmtCal.getTime() + "]");

		return gmtCal;
	}

	private boolean isParametersValid(String realm, String faction) {
	    boolean valid = SUPPORTED_REALMS.contains(realm.toLowerCase()) && SUPPORTED_FACTIONS.contains(faction.toLowerCase());
	    if (!valid) {
			log.error(String.format("Invalid parameters: %s %s", realm, faction));
		}
        return valid;
	}

	@Cacheable(value="marketprice", key="{#itemId + #realm + #faction + #timespan}")
	@GetMapping(value = "/api/marketprice")
	public List<Marketprice> marketpriceList(
			@RequestParam("itemId") Integer itemId,
			@RequestParam(name = "timespan") Integer timespan,
			@RequestParam(name = "realm") String realm,
			@RequestParam(name = "faction") String faction
	) {
		if (!isParametersValid(realm, faction)) {
			return Collections.emptyList();
		}

		Calendar calendar = Calendar.getInstance();
		calendar.setTimeZone(TimeZone.getTimeZone("UTC"));
		List<Marketprice> prices;
		if (timespan == 2) {
			calendar.add(Calendar.MONTH, -1);
			prices = new ArrayList<>(dailyMarketpriceRepository.findAllByRealmAndFactionAndAndItemIdAndTimestampAfterOrderByTimestamp(
					realm.toLowerCase().replace(" ", ""),
					faction.toLowerCase(),
					itemId,
					calendar
			)).stream().map(Marketprice::getMarketprice).collect(Collectors.toList());
		} else if (timespan== 1) {
			calendar.add(Calendar.WEEK_OF_MONTH, -1);
			prices = new ArrayList<>(dailyMarketpriceRepository.findAllByRealmAndFactionAndAndItemIdAndTimestampAfterOrderByTimestamp(
					realm.toLowerCase().replace(" ", ""),
					faction.toLowerCase(),
					itemId,
					calendar
			)).stream().map(Marketprice::getMarketprice).collect(Collectors.toList());
		} else if (timespan == 0) {
			calendar.add(Calendar.HOUR_OF_DAY, -12);
			prices = new ArrayList<>(hourlyMarketpriceRepository.findAllByRealmAndFactionAndAndItemIdAndTimestampAfterOrderByTimestamp(
					realm.toLowerCase().replace(" ", ""),
					faction.toLowerCase(),
					itemId,
					calendar
			)).stream().map(Marketprice::getMarketprice).collect(Collectors.toList());
		} else {
			return Collections.emptyList();
		}

		return prices
				.stream()
				.filter(m -> m.getPrice() > 0)  // skip items w/o buyout
				.peek(m -> m.setTimestamp(convertToGmt(m.getTimestamp()))).collect(Collectors.toList());
    }

	@Cacheable(value="autoComplete", key="{#query + #realm + #faction}")
	@GetMapping(value = "/api/autocomplete")
	public List<Map<String, Object>> searchSuggestions(
			@RequestParam("q") String query,
			@RequestParam(name = "realm") String realm,
			@RequestParam(name = "faction") String faction
	) {
		if (!isParametersValid(realm, faction)) {
			return Collections.emptyList();
		}
		SuggestionBuilder suggestionBuilder = SuggestBuilders
				.completionSuggestion("suggest")
				.prefix(normalizeQuery(query))
				.skipDuplicates(true) // doesn't seem to work reliably due to the way the tokens are generated
				.size(5);

		SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
		sourceBuilder.suggest(new SuggestBuilder().addSuggestion("item-suggest", suggestionBuilder));

		SearchRequest searchRequest = new SearchRequest();
		searchRequest.indices(String.format("ah_item_%s_%s", realm.toLowerCase(), faction.toLowerCase()));
		searchRequest.source(sourceBuilder);

		List<Map<String, Object>> suggestions = new ArrayList<>();
		Set<Integer> suggestionsSeen = new HashSet<>();

		try {
			SearchResponse searchResponse = client.search(searchRequest, RequestOptions.DEFAULT);
			Suggest suggest = searchResponse.getSuggest();
			CompletionSuggestion completionSuggestion = suggest.getSuggestion("item-suggest");
			for (CompletionSuggestion.Entry entry : completionSuggestion.getEntries()) {
				for (CompletionSuggestion.Entry.Option option : entry) {
					Map<String, Object> sourceMap = option.getHit().getSourceAsMap();
					HashMap<String, Object> resultsMap = new HashMap<>();
					Integer id;
					try {
						id = (Integer) sourceMap.get("id");
					} catch (ClassCastException e) {
						id = Integer.parseInt((String) sourceMap.get("id"));
					}

					if (suggestionsSeen.contains(id)) {
						continue;
					}

					MetaItem metaItem = metaItemService.getItem(id);
					resultsMap.put("quality", metaItem.getQuality());
					resultsMap.put("icon", metaItem.getIcon());
					resultsMap.put("classType", metaItem.getClassType());
					resultsMap.put("itemName", sourceMap.get("itemName"));
					resultsMap.put("timestamp", sourceMap.get("timestamp"));
					resultsMap.put("id", sourceMap.get("id"));
					suggestions.add(resultsMap);
					suggestionsSeen.add(id);
				}
			}
		} catch (ElasticsearchStatusException e) {
			log.error(e);
		} catch (ResponseException e) {
			log.error("Error retrieving search response: ", e);
		} catch (IOException e) {
			log.error("Error with search request: ", e);
		}

		return suggestions;
	}

	@Cacheable(value="count", key="{#query + #realm + #faction}")
	public Long getCount(
			@RequestParam("q") String query,
			@RequestParam(name = "realm") String realm,
			@RequestParam(name = "faction") String faction
	) {
		if (!isParametersValid(realm, faction)) {
			return 0L;
		}
		QueryBuilder queryBuilder = QueryBuilders.matchPhrasePrefixQuery("itemName", normalizeQuery(query).toLowerCase());
		CountRequest countRequest = new CountRequest();
		countRequest.indices(String.format("ah_item_%s_%s", realm.toLowerCase(), faction.toLowerCase()));
		countRequest.source(new SearchSourceBuilder().query(queryBuilder));

		long count = 0;
		try {
            CountResponse countResponse = client.count(countRequest, RequestOptions.DEFAULT);
            count = countResponse.getCount();
			log.debug("Found {} search hits for [{}/{}] {}", count, realm, faction, query);
		} catch (ElasticsearchStatusException e) {
			log.error(e);
		} catch (ResponseException e) {
			log.error("Error retrieving count: ", e);
		} catch (IOException e) {
			log.error("Error with count request: ", e);
		}

		return count;
	}

	private void addSort(SearchSourceBuilder sourceBuilder, String sortField, Integer sortFieldOrder) {
		SortOrder[] sortOrders = {null, SortOrder.DESC, SortOrder.ASC};

        SortOrder sortOrder = sortOrders[sortFieldOrder];
        if (sortOrder == null) {
            return;
        }

        FieldSortBuilder fieldSortBuilder =  SortBuilders
                .fieldSort(sortField)
                .order(sortOrder);

        sourceBuilder.sort(fieldSortBuilder);
	}

    @Cacheable(value="popularQueries", key="{#query + #page + #realm + #faction + #pageSize + #sortField + #sortFieldOrder}")
	@GetMapping(value = "/api/search")
    public Map<String, Object> searchData(
    		@RequestParam("q") String query,
			@RequestParam(name = "p", defaultValue = "0") Integer page,
			@RequestParam(name = "realm") String realm,
			@RequestParam(name = "faction") String faction,
			@RequestParam(name = "pS", defaultValue = "15") Integer pageSize,
			@RequestParam(name = "sortField", required = false) String sortField,
			@RequestParam(name = "sortFieldOrder", required = false) Integer sortFieldOrder
	) {
		if (!isParametersValid(realm, faction)) {
			return Collections.emptyMap();
		}

		Instant startQueryTime = Instant.now();
		QueryBuilder queryBuilder = QueryBuilders.matchPhrasePrefixQuery("itemName", normalizeQuery(query).toLowerCase());

		SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
		sourceBuilder.query(queryBuilder);
		sourceBuilder.from(page * pageSize);  // each page has 15 results on the front-end
		sourceBuilder.size(pageSize);
		sourceBuilder.timeout(new TimeValue(30, TimeUnit.SECONDS));

		SearchRequest searchRequest = new SearchRequest();
		searchRequest.indices(String.format("ah_item_%s_%s", realm.toLowerCase(), faction.toLowerCase()));
		searchRequest.source(sourceBuilder);

		if (sortField != null && sortFieldOrder != null) {
			if (!SUPPORTED_FIELDS.contains(sortField.toLowerCase()) && ImmutableList.of(0, 1, 2).contains(sortFieldOrder)) {
				log.error(String.format("Invalid parameters: %s %s", sortField, sortFieldOrder));
				return Collections.emptyMap();
			}
			addSort(sourceBuilder, sortField, sortFieldOrder);
		}

		List<Item> items = new ArrayList<>();
		long count = 0;
		final Long queryMs;
		try {
			SearchResponse searchResponse = client.search(searchRequest, RequestOptions.DEFAULT);
			log.debug("Status of search: {}", searchResponse.status());
			SearchHit[] searchHits = searchResponse.getHits().getHits();
			if (searchHits.length > 0) {
				count = getCount(query, realm, faction) - searchHits.length - (page * pageSize);
				Arrays.stream(searchHits)
						.map(hit -> objectMapper.convertValue(hit.getSourceAsMap(), Item.class))
						.forEach(item -> {
							MetaItem metaItem = metaItemService.getItem(item.getId());
							item.setMetaItem(metaItem);
							items.add(item);
						});
			}
			log.debug("Returning {} search hits", searchHits.length);
		} catch (ElasticsearchStatusException e) {
			log.error(e);
		} catch (ResponseException e) {
			log.error("Error retrieving search response: ", e);
		} catch (IOException e) {
			log.error("Error with search request: ", e);
		} finally {
			Instant endQueryTime = Instant.now();
			queryMs = endQueryTime.toEpochMilli() - startQueryTime.toEpochMilli();
		}

		return ImmutableMap.of("items", items, "page", page, "count", count, "queryMs", queryMs);
	}

	@GetMapping(value = "/api/getRealms")
	public List<String> getRealms() {
	    return US_WEST;
	}
}
