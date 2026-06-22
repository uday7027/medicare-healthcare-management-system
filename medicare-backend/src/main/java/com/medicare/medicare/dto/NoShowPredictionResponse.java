package com.medicare.medicare.dto;

import lombok.Data;

@Data
public class NoShowPredictionResponse {
    private double no_show_probability;
    private double show_probability;
}
