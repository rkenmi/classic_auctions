package com.rkenmi.classicah.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MetaItem implements Serializable {
    private String name;
    private Integer id;
    private String icon;
    private String slot;
    private Integer itemLvl;
    private Integer minLvlRequired;
    private Integer maxStack;
    private String quality;
    private String classType;
    private String subclassType;
    private Integer contentPhase;
    private Integer sellPrice;
    private Integer vendorPrice;

    private Map<String, Object> source;
    private List<Object> createdBy;
}
