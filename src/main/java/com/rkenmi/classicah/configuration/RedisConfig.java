package com.rkenmi.classicah.configuration;

import io.lettuce.core.resource.ClientResources;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;

import java.time.Duration;
import java.util.Collections;
import java.util.List;

@Profile("default")
@Configuration
@EnableCaching
public class RedisConfig {

    @Value("${redis.hostname}")
    private String redisHostName;

    @Value("${redis.port}")
    private int redisPort;

//    @Value("${redis.pw}")
//    private String redisPw;

    @Value("${redis.prefix}")
    private String redisPrefix;

    private ClientResources clientResources;

    @Autowired
    public RedisConfig(ClientResources clientResources) {
        this.clientResources = clientResources;
    }

    @Bean
    LettuceConnectionFactory lettuceConnectionFactory() {
        RedisStandaloneConfiguration standaloneConfiguration = new RedisStandaloneConfiguration();
        standaloneConfiguration.setHostName(redisHostName);
        standaloneConfiguration.setPort(redisPort);
        LettuceClientConfiguration lettuceClientConfiguration = LettuceClientConfiguration.builder()
                .clientResources(clientResources)
                .build();
        LettuceConnectionFactory factory = new LettuceConnectionFactory(standaloneConfiguration, lettuceClientConfiguration);
        factory.afterPropertiesSet();
        return factory;
    }

    @Bean(value = "redisTemplate")
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
        RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(redisConnectionFactory);
        return redisTemplate;
    }

    @Bean(name = "cacheManager")
    public CacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {
        return RedisCacheManager.builder(redisConnectionFactory).cacheDefaults(RedisCacheConfiguration.defaultCacheConfig().prefixKeysWith(redisPrefix)).build();
    }

    @Primary
    @Bean(name = "cacheManager5Min")
    public CacheManager cacheManager1Hour(RedisConnectionFactory redisConnectionFactory) {
        Duration expiration = Duration.ofMinutes(5);
        return RedisCacheManager.builder(redisConnectionFactory)
                .cacheDefaults(RedisCacheConfiguration.defaultCacheConfig().prefixKeysWith(redisPrefix).entryTtl(expiration)).build();
    }
}
