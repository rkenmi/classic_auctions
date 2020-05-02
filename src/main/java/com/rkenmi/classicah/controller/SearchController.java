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
import com.google.common.collect.ImmutableMap;
import com.rkenmi.classicah.document.Item;
import lombok.extern.log4j.Log4j2;
import org.elasticsearch.ElasticsearchStatusException;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.common.unit.TimeValue;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.rest.RestStatus;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import static com.rkenmi.classicah.data.SupportedRealms.US_WEST;

/**
 * @author Rick Miyamoto
 */
@Log4j2
@RestController
public class SearchController {
    private RestHighLevelClient client;
    private ObjectMapper objectMapper = new ObjectMapper();

	@Autowired
    public SearchController(RestHighLevelClient client) {
    	this.client = client;
	}

    @Cacheable(value="popularQueries", key="{#query + #page + #realm + #faction}")
	@GetMapping(value = "/api/search")
    public Map<String, Object> searchData(
    		@RequestParam("q") String query,
			@RequestParam(name = "p", defaultValue = "0") Integer page,
			@RequestParam(name = "realm") String realm,
			@RequestParam(name = "faction") String faction
	) {
		Instant startQueryTime = Instant.now();
		QueryBuilder queryBuilder = QueryBuilders.matchPhrasePrefixQuery("itemName", query.toLowerCase());

		SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
		sourceBuilder.query(queryBuilder);
		sourceBuilder.from(page * 15);  // each page has 15 results on the front-end
		sourceBuilder.size(90);
		sourceBuilder.timeout(new TimeValue(60, TimeUnit.SECONDS));

		SearchRequest searchRequest = new SearchRequest();
		searchRequest.indices(String.format("ah_item_%s_%s", realm.toLowerCase(), faction.toLowerCase()));
		searchRequest.source(sourceBuilder);

		List<Item> items = new ArrayList<>();
		Long queryMs;
		try {
			SearchResponse searchResponse = client.search(searchRequest, RequestOptions.DEFAULT);
			log.debug("Status of search: {}", searchResponse.status());
			SearchHit[] searchHits = searchResponse.getHits().getHits();
			if (searchHits.length > 0) {
				Arrays.stream(searchHits)
						.forEach(hit -> items.add(objectMapper.convertValue(hit.getSourceAsMap(), Item.class)));
			}
			log.info("Returning {} search hits", searchHits.length);
		} catch (ElasticsearchStatusException e) {
			if (e.status().equals(RestStatus.NOT_FOUND)) {
				log.error("Index not found!");
			}
		} catch (IOException e) {
			log.error("Error with search request: ", e);
		} finally {
			Instant endQueryTime = Instant.now();
			queryMs = endQueryTime.toEpochMilli() - startQueryTime.toEpochMilli();
		}

		return ImmutableMap.of("items", items, "page", page, "queryMs", queryMs);
	}

	@GetMapping(value = "/api/getRealms")
	public List<String> getRealms() {
	    return US_WEST;
	}
}
