package com.rkenmi.classicah.repositories;

import com.rkenmi.classicah.model.HourlyMarketprice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Calendar;
import java.util.List;

@Repository
public interface HourlyMarketpriceRepository extends JpaRepository<HourlyMarketprice, Long> {
    List<HourlyMarketprice> findAllByRealmAndFactionAndAndItemId(String realm, String faction, Integer itemId);
    List<HourlyMarketprice> findAllByRealmAndFactionAndAndItemIdAndTimestampAfterOrderByTimestamp(
            String realm, String faction, Integer itemId, Calendar timestamp
    );
    List<HourlyMarketprice> findAllByRealmAndFactionAndAndItemIdAndTimestampBetweenOrderByTimestamp(
            String realm, String faction, Integer itemId, Calendar timestampStart, Calendar timestampEnd
    );
}
