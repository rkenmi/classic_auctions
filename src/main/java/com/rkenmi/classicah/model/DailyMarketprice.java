package com.rkenmi.classicah.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import java.io.Serializable;
import java.util.Calendar;

@Entity
@Table(name="ah_marketprice_days", schema="public")
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DailyMarketprice implements Serializable {
    @Id
    @Column(name="id")
    private Long id;

    @Column(name="realm")
    private String realm;

    @Column(name="faction")
    private String faction;

    @Column(name="item_id")
    private Integer itemId;

    @Column(name="price")
    private Integer price;

    @Column(name="quantity")
    private Integer quantity;

    @Temporal(TemporalType.TIMESTAMP)
    private Calendar timestamp;
}

