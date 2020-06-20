package com.rkenmi.classicah.model;

import lombok.Builder;
import lombok.Data;

import java.io.Serializable;
import java.util.Calendar;

@Builder
@Data
public class Marketprice implements Serializable {
    private String realm;
    private String faction;
    private Integer itemId;
    private Integer price;
    private Integer quantity;
    private Calendar timestamp;

    public static Marketprice getMarketprice(DailyMarketprice dailyMarketprice) {
        return builder()
                .realm(dailyMarketprice.getRealm())
                .faction(dailyMarketprice.getFaction())
                .itemId(dailyMarketprice.getItemId())
                .price(dailyMarketprice.getPrice())
                .quantity(dailyMarketprice.getQuantity())
                .timestamp(dailyMarketprice.getTimestamp())
                .build();
    }

    public static Marketprice getMarketprice(HourlyMarketprice hourlyMarketprice) {
        return builder()
                .realm(hourlyMarketprice.getRealm())
                .faction(hourlyMarketprice.getFaction())
                .itemId(hourlyMarketprice.getItemId())
                .price(hourlyMarketprice.getPrice())
                .quantity(hourlyMarketprice.getQuantity())
                .timestamp(hourlyMarketprice.getTimestamp())
                .build();
    }
}
