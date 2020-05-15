package com.rkenmi.classicah.service;

import com.rkenmi.classicah.model.MetaItem;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Log4j2
public class MetaItemService {
    Map<Integer, MetaItem> metaItemMap = new HashMap<>();

    public void initialize(List<MetaItem> items) {
        items.forEach(i -> metaItemMap.put(i.getId(), i));
    }

    public MetaItem getItem(Integer id) {
        return metaItemMap.get(id);
    }
}
