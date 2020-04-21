package com.rkenmi.classicah.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.elasticsearch.annotations.Document;

import java.io.Serializable;
import java.util.Date;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Document(indexName = "ah_item")
public class Item implements Serializable {
    private String rarity;
    private Integer id;
    private String itemName;
    private Integer itemLvl;
    private Integer minLvlRequired;
    private String bid;
    private String buyout;
    private String seller;
    private Integer timeRemaining;
    private Date timestamp;
}
