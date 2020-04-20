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
import com.rkenmi.classicah.repository.ItemRepository;
import com.rkenmi.classicah.document.Item;
import lombok.extern.log4j.Log4j2;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.common.unit.TimeValue;
import org.elasticsearch.index.query.MultiMatchQueryBuilder;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.index.reindex.ScrollableHitSource;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.search.fetch.QueryFetchSearchResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;
import org.springframework.data.elasticsearch.core.query.NativeSearchQueryBuilder;
import org.springframework.data.elasticsearch.core.query.SearchQuery;
import org.springframework.data.util.CloseableIterator;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * @author Rick Miyamoto
 */
@Log4j2
@RestController
public class SearchController {
    private ItemRepository itemRepository;
    private RestHighLevelClient client;
    private ObjectMapper objectMapper = new ObjectMapper();

	@Autowired
    private SearchController(ItemRepository itemRepository, RestHighLevelClient client) {
    	this.itemRepository = itemRepository;
    	this.client = client;
	}

	@GetMapping(value = "/api/search")
//	public Collection<Item> searchData(@RequestParam("q") String query, @RequestParam(name = "p", defaultValue = "0") Integer page) {
    public Map<String, Object> searchData(@RequestParam("q") String query, @RequestParam(name = "p", defaultValue = "0") Integer page) {
//		QueryBuilder queryBuilder = QueryBuilders.multiMatchQuery(query)
//				.field("itemName")
//				.field("seller")
//				.type(MultiMatchQueryBuilder.Type.BEST_FIELDS);

		QueryBuilder queryBuilder = QueryBuilders.prefixQuery("itemName", query.toLowerCase());

//		SearchQuery searchQuery = new NativeSearchQueryBuilder()
//				.withQuery(queryBuilder)
//				.build();

		SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
		sourceBuilder.query(queryBuilder);
		sourceBuilder.from(page * 15);  // each page has 15 results on the front-end
		sourceBuilder.size(60);
		sourceBuilder.timeout(new TimeValue(60, TimeUnit.SECONDS));

		SearchRequest searchRequest = new SearchRequest();
		searchRequest.indices("ah_item");
		searchRequest.source(sourceBuilder);

		List<Item> items = new ArrayList<>();
		try {
			SearchResponse searchResponse = client.search(searchRequest, RequestOptions.DEFAULT);
			log.debug("Status of search: {}", searchResponse.status());
			log.info("Scroll id {}", searchResponse.getScrollId());
			SearchHit[] searchHits = searchResponse.getHits().getHits();
			if (searchHits.length > 0) {
				Arrays.stream(searchHits)
						.forEach(hit -> items.add(objectMapper.convertValue(hit.getSourceAsMap(), Item.class)));
			}
			log.info("Returning {} search hits", searchHits.length);
		} catch (IOException e) {
			log.error("Error with search request: ", e);
//			return Collections.emptyList();
			return Collections.emptyMap();
		}

		return ImmutableMap.of("items", items, "page", page);

//		return items;
	}
}
