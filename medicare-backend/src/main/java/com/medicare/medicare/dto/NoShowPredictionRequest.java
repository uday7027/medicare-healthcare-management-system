package com.medicare.medicare.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class NoShowPredictionRequest {
    private String appointmentDate;
    private String scheduledDate;
    private String mode;
    private int missedVisits;
    private String gender;
    private int age;

    public void setDayOfWeek(int value) {
    }

    public void setHour(int hour) {
    }
}
