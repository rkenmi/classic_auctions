package com.rkenmi.classicah.document;

import com.google.common.collect.ImmutableMap;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.elasticsearch.annotations.Document;

import java.util.Date;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Document(indexName = "ah_item")
public class Item {
    private Integer rarity;
    private Integer id;
    private String itemName;
    private Integer itemLvl;
    private Integer minLvlRequired;
    private String bid;
    private String buyout;
    private String seller;
    private String timeRemaining;
    private Date dateCreated;

    private final static String SHORT_DURATION = "Short";
    private final static String MEDIUM_DURATION = "Medium";
    private final static String LONG_DURATION = "Long";
    private final static String VERY_LONG_DURATION = "Very Long";
    private final static ImmutableMap STRING_MAP = ImmutableMap.of(
            1, SHORT_DURATION,
            2, MEDIUM_DURATION,
            3, LONG_DURATION,
            4, VERY_LONG_DURATION
    );

    private final static ImmutableMap ITEM_RARITY_MAP = ImmutableMap.of(
            "ffffff", 1,
            "1eff00", 2,
            "0070dd", 3,
            "a335ee", 4
    );

    public static Integer getCopper(String num) {
        return Integer.parseInt(num) % 100;
    }

    public static Integer getSilver(String num) {
        return (Integer.parseInt(num) / 100) % 100;
    }

    public static Integer getGold(String num) {
        return (Integer.parseInt(num) / 10000) % 100;
    }

    public static String timeRemainingIntCodeToString(final int code) {
        return (String) STRING_MAP.get(code);
    }

    public static Integer htmlColorCodeToRarity(final String htmlColor) {
        return (Integer) ITEM_RARITY_MAP.getOrDefault(htmlColor, 1);
    }
}
