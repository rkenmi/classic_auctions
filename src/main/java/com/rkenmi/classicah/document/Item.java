package com.rkenmi.classicah.document;

import com.rkenmi.classicah.model.MetaItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.elasticsearch.annotations.Document;

import java.io.Serializable;
import java.util.Date;
import java.util.List;
import java.util.Objects;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Document(indexName = "ah_item")
public class Item implements Serializable {
    private Integer id;
    private String itemName;
    private Long bid;
    private Long buyout;
    private String seller;
    private Integer timeRemaining;
    private Integer quantity;
    private Date timestamp;
    private List<String> suggest;

    private MetaItem metaItem;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Item item = (Item) o;
        return id == item.id;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
