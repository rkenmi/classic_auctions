package com.rkenmi.classicah.repositories;

import com.rkenmi.classicah.model.DailyMarketprice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Calendar;
import java.util.List;

@Repository
public interface DailyMarketpriceRepository extends JpaRepository<DailyMarketprice, Long> {
    List<DailyMarketprice> findAllByRealmAndFactionAndAndItemId(String realm, String faction, Integer itemId);
    List<DailyMarketprice> findAllByRealmAndFactionAndAndItemIdAndTimestampAfterOrderByTimestamp(
            String realm, String faction, Integer itemId, Calendar timestamp
    );
    List<DailyMarketprice> findAllByRealmAndFactionAndAndItemIdAndTimestampBetweenOrderByTimestamp(
            String realm, String faction, Integer itemId, Calendar timestampStart, Calendar timestampEnd
    );
}
