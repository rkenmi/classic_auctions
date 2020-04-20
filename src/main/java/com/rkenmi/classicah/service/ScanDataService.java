package com.rkenmi.classicah.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.S3Object;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rkenmi.classicah.document.Item;
import lombok.extern.log4j.Log4j2;
import org.elasticsearch.action.bulk.BulkRequest;
import org.elasticsearch.action.bulk.BulkResponse;
import org.elasticsearch.action.delete.DeleteRequest;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.ElasticsearchClient;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Log4j2
@Service
public class ScanDataService {
    private AmazonS3 amazonS3;
    private RestHighLevelClient client;
    ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.awsServices.bucketName}")
    private String s3Bucket;

    @Autowired
    public ScanDataService(AmazonS3 amazonS3, RestHighLevelClient client) {
        this.amazonS3 = amazonS3;
        this.client = client;
    }

//    @Cacheable("CacheCluster")
    public List<Item> getAuctionHouseItems() {
        return getAuctionHouseItemLua();
    }

    private List<Item> getAuctionHouseItemLua() {
        S3Object object = amazonS3.getObject(s3Bucket, "realm/bigglesworth/horde/Auc-ScanData.lua");
        try {
            createDocuments(readLuaObject(object));
        } catch (IOException e) {
            ;
        }
        return null;
//            createDocuments(items);
    }

    private List<Item> readLuaObject(final S3Object s3Object) {
        final List<Item> items = new ArrayList<>();
        try {
            InputStreamReader in = new InputStreamReader(s3Object.getObjectContent());
//            FileReader in = new FileReader("Auc-ScanData.lua");
            BufferedReader bufferedReader = new BufferedReader(in);
            StringBuffer buffer = new StringBuffer();
            String line;

            while((line = bufferedReader.readLine()) != null) {
                buffer.append(line);
            }
            String out = buffer.toString();

            String itemRegex = "(\\{\\\\\"\\|[a-zA-Z0-9]+\\|Hitem:[0-9]+[:0-9\\:\\'\\|a-zA-Z\\[\\]\\s\\\\\\\",]+})";

            Matcher itemMatcher = Pattern.compile(itemRegex).matcher(out);

            while (itemMatcher.find()) {
                String itemLua = itemMatcher.group();
                String itemFeaturesRegex = "\\{\\\\\"\\|cff([a-zA-Z0-9]+)\\|Hitem:([0-9]+)[:0-9]+\\|h\\[([a-zA-Z\\:\\'\\\"\\s]+)\\]\\|h\\|r\\\\\\\",([0-9]+|nil),[0-9]+,[0-9]+,nil,([0-9]+),([1234]),[0-9]+,\\\\\"[a-zA-Z\\:\\'\\\"\\s]+\\\\\",(?:[0-9]+|nil),[0-9]+,[0-9]+,(?:false|true),([0-9]+),[0-9]+,[0-9]+,([0-9]+),[0-9]+,(?:true|false),\\\\\"([a-zA-Z]*)\\\\\",[0-9]+,\\\\\"([a-zA-Z]*)\\\\\",[0-9]+,[0-9]+,[0-9]+,[0-9]+,[0-9]+,\\}";
                Matcher itemFeatureMatcher = Pattern.compile(itemFeaturesRegex).matcher(itemLua);
                if (itemFeatureMatcher.find()) {
                    Item item = Item.builder()
                            .rarity(Item.htmlColorCodeToRarity(itemFeatureMatcher.group(1)))
                            .id(Integer.parseInt(itemFeatureMatcher.group(2)))
                            .itemName(itemFeatureMatcher.group(3))
                            .itemLvl(Integer.parseInt(itemFeatureMatcher.group(4)))
                            .bid(itemFeatureMatcher.group(5))
                            .timeRemaining(Item.timeRemainingIntCodeToString(Integer.parseInt(itemFeatureMatcher.group(6))))
                            .minLvlRequired(Integer.parseInt(itemFeatureMatcher.group(7)))
                            .buyout(itemFeatureMatcher.group(8))
                            .seller(itemFeatureMatcher.group(9))
                            .dateCreated(s3Object.getObjectMetadata().getLastModified())
                            .build();
                    items.add(item);
                    log.info("Retrieved item {}", item);
                }
            }
        } catch (IOException e) {
            log.error("Failed to read data", e);
        }

        return items;
    }

    public void createDocuments(List<Item> items) throws IOException {
        BulkRequest bulkRequest = new BulkRequest();
        for (Item i : items) {
            Map<String, Object> map =
                    objectMapper.convertValue(i, new TypeReference<Map<String, Object>>() {});
            bulkRequest.add(new IndexRequest("ah_item").source(map).type("item"));
        }
        BulkResponse bulkResponse = client.bulk(bulkRequest, RequestOptions.DEFAULT);
        bulkResponse.status();
    }

    public List<Item> findAll() throws Exception {

        SearchRequest searchRequest = new SearchRequest();
        SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();
        searchSourceBuilder.query(QueryBuilders.matchAllQuery());
        searchRequest.source(searchSourceBuilder);

        SearchResponse searchResponse =
                client.search(searchRequest, RequestOptions.DEFAULT);


        SearchHit[] searchHit = searchResponse.getHits().getHits();

        List<Item> items = new ArrayList<>();

        if (searchHit.length > 0) {
            Arrays.stream(searchHit)
                    .forEach(hit -> items.add(objectMapper.convertValue(hit.getSourceAsMap(), Item.class)));
        }

        return items;
//        return getSearchResult(searchResponse);

    }

}
