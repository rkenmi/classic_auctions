package com.rkenmi.classicah.configuration;

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
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;

import java.time.Duration;

@Profile("dev")
@Configuration
@EnableCaching
public class LocalRedisConfig {

    @Value("${redis.hostname}")
    private String redisHostName;

    @Value("${redis.port}")
    private int redisPort;

    @Value("${redis.prefix}")
    private String redisPrefix;

    @Bean
    LettuceConnectionFactory lettuceConnectionFactory() {
        RedisStandaloneConfiguration redisStandaloneConfiguration = new RedisStandaloneConfiguration(redisHostName, redisPort);
        return new LettuceConnectionFactory(redisStandaloneConfiguration);
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

