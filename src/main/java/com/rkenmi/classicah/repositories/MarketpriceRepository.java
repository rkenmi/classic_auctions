package com.rkenmi.classicah.repositories;

import com.rkenmi.classicah.model.Marketprice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

@Repository
public interface MarketpriceRepository extends JpaRepository<Marketprice, Long> {
    List<Marketprice> findAllByRealmAndFactionAndAndItemId(String realm, String faction, Integer itemId);
    List<Marketprice> findAllByRealmAndFactionAndAndItemIdAndTimestampAfterOrderByTimestamp(
            String realm, String faction, Integer itemId, Calendar timestamp
    );
    List<Marketprice> findAllByRealmAndFactionAndAndItemIdAndTimestampBetweenOrderByTimestamp(
            String realm, String faction, Integer itemId, Calendar timestampStart, Calendar timestampEnd
    );
}
