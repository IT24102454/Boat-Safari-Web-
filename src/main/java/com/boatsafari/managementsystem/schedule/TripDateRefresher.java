// src/main/java/com/boatsafari/managementsystem/schedule/TripDateRefresher.java
package com.boatsafari.managementsystem.schedule;

import com.boatsafari.managementsystem.repository.TripRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;

@Component
public class TripDateRefresher {

    private static final Logger log = LoggerFactory.getLogger(TripDateRefresher.class);

    private final TripRepository tripRepository;

    @Value("${app.timezone:Asia/Colombo}")
    private String appTimezone;

    public TripDateRefresher(TripRepository tripRepository) {
        this.tripRepository = tripRepository;
    }

    private LocalDate today() {
        return LocalDate.now(ZoneId.of(appTimezone));
    }

    // Run once after application starts
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void onStartupRefresh() {
        int updated = tripRepository.bulkRollPastTripsToToday(today());
        if (updated > 0) log.info("TripDateRefresher (startup): rolled {} trips to today {}", updated, today());
        else log.info("TripDateRefresher (startup): no trips needed date refresh");
    }

    // Run daily at 00:00 (midnight) in configured timezone
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void nightlyRefresh() {
        int updated = tripRepository.bulkRollPastTripsToToday(today());
        if (updated > 0) log.info("TripDateRefresher (nightly): rolled {} trips to today {}", updated, today());
    }
}