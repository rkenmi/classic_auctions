package com.rkenmi.classicah.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.S3Object;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rkenmi.classicah.document.Item;
import lombok.extern.log4j.Log4j2;
import org.elasticsearch.action.admin.indices.delete.DeleteIndexRequest;
import org.elasticsearch.action.bulk.BulkRequest;
import org.elasticsearch.action.bulk.BulkResponse;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.client.indices.GetIndexRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Profile("dev")
@Log4j2
@Service
public class ScannerService {
    private AmazonS3 amazonS3;
    private RestHighLevelClient client;
    ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.awsServices.bucketName}")
    private String s3Bucket;

    private static final String INDEX = "ah_item_bigglesworth_horde";

    @Autowired
    public ScannerService(AmazonS3 amazonS3, RestHighLevelClient client) {
        this.amazonS3 = amazonS3;
        this.client = client;
    }

    public void refreshData() {
        log.info("Wiping the local index");
        try {
            boolean indexExists = client.indices().exists(new GetIndexRequest(INDEX), RequestOptions.DEFAULT);
            if (indexExists) {
                client.indices().delete(new DeleteIndexRequest(INDEX), RequestOptions.DEFAULT);
            }

            storeS3DataIntoLocalElasticsearch();
            log.info("Index is now refreshed with newest data from S3");
        } catch (IOException e) {
            log.error("Failed to delete data in local elasticsearch: ", e);
        }
    }

    private void storeS3DataIntoLocalElasticsearch() {
        S3Object object = amazonS3.getObject(s3Bucket, "realm/bigglesworth/horde/Auc-ScanData.lua");
        try {
            createDocuments(readLuaObject(object));
        } catch (IOException e) {
            log.error("Failed to store data into local elasticsearch: ", e);
        }
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
                String itemFeaturesRegex = "\\{\\\\\"\\|cff([a-zA-Z0-9]+)\\|Hitem:([0-9]+)[:0-9]+\\|h\\[([a-zA-Z\\:\\'\\\"\\s]+)\\]\\|h\\|r\\\\\\\",([0-9]+|nil),[0-9]+,[0-9]+,nil,([0-9]+),([1234]),[0-9]+,\\\\\"[a-zA-Z\\:\\'\\\"\\s]+\\\\\",(?:[0-9]+|nil),([0-9]+),[0-9]+,(?:false|true),([0-9]+),[0-9]+,[0-9]+,([0-9]+),[0-9]+,(?:true|false),\\\\\"([a-zA-Z]*)\\\\\",[0-9]+,\\\\\"([a-zA-Z]*)\\\\\",[0-9]+,[0-9]+,[0-9]+,[0-9]+,[0-9]+,\\}";
                Matcher itemFeatureMatcher = Pattern.compile(itemFeaturesRegex).matcher(itemLua);
                if (itemFeatureMatcher.find()) {
                    Item item = Item.builder()
                            .rarity(itemFeatureMatcher.group(1))
                            .id(Integer.parseInt(itemFeatureMatcher.group(2)))
                            .itemName(itemFeatureMatcher.group(3))
                            .itemLvl(Integer.parseInt(itemFeatureMatcher.group(4)))
                            .bid(itemFeatureMatcher.group(5))
                            .timeRemaining(Integer.parseInt(itemFeatureMatcher.group(6)))
                            .quantity(Integer.parseInt(itemFeatureMatcher.group(7)))
                            .minLvlRequired(Integer.parseInt(itemFeatureMatcher.group(8)))
                            .buyout(itemFeatureMatcher.group(9))
                            .seller(itemFeatureMatcher.group(10))
                            .timestamp(s3Object.getObjectMetadata().getLastModified())
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
            bulkRequest.add(new IndexRequest(INDEX).source(map).type("_doc"));
        }
        BulkResponse bulkResponse = client.bulk(bulkRequest, RequestOptions.DEFAULT);
        bulkResponse.status();
    }
}
