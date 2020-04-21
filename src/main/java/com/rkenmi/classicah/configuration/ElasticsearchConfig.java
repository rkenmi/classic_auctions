package com.rkenmi.classicah.configuration;

import com.amazonaws.auth.AWSCredentialsProvider;
import com.google.common.base.Supplier;
import org.apache.http.HttpHost;
import org.apache.http.HttpRequestInterceptor;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestHighLevelClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.config.AbstractElasticsearchConfiguration;
import vc.inreach.aws.request.AWSSigner;
import vc.inreach.aws.request.AWSSigningRequestInterceptor;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Configuration
public class ElasticsearchConfig extends AbstractElasticsearchConfiguration {

    @Value("${elasticsearch.host}")
    private String elasticsearchHost;

    private final String serviceName = "es";

    @Value("${cloud.aws.region.static}")
    private String region;

    @Value("${elasticsearch.port}")
    private Integer port;

    private final AWSCredentialsProvider credentialsProvider;

    @Autowired
    public ElasticsearchConfig(AWSCredentialsProvider awsCredentialsProvider) {
        this.credentialsProvider = awsCredentialsProvider;
    }

    @Override
    @Bean
    public RestHighLevelClient elasticsearchClient() {
        final Supplier<LocalDateTime> clock = () -> LocalDateTime.now(ZoneOffset.UTC);
        AWSSigner signer = new AWSSigner(credentialsProvider, region, serviceName, clock);
        HttpRequestInterceptor interceptor = new AWSSigningRequestInterceptor(signer);
        RestHighLevelClient restHighLevelClient = new RestHighLevelClient(RestClient.builder(HttpHost.create(elasticsearchHost))
                .setHttpClientConfigCallback(hacb -> hacb.addInterceptorLast(interceptor)));

        return restHighLevelClient;
    }


}
