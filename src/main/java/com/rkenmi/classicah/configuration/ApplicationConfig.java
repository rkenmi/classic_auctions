package com.rkenmi.classicah.configuration;

import com.amazonaws.auth.AWSCredentialsProvider;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Log4j2
@Configuration
public class ApplicationConfig {
    private ApplicationContext applicationContext;

    @Autowired
    public ApplicationConfig(ApplicationContext applicationContext) {
       this.applicationContext = applicationContext;
    }

    @Bean
    AmazonS3 getAmazonS3Client(AWSCredentialsProvider awsCredentialsProvider, @Value("us-west-1") String region) {
        return AmazonS3ClientBuilder.standard().withCredentials(awsCredentialsProvider).withRegion(region).build();
    }
}
