package com.medicare.medicare.Service;

import com.medicare.medicare.dto.NoShowPredictionRequest;
import com.medicare.medicare.dto.NoShowPredictionResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class NoShowPredictionService {

    @Value("${ml.service.url}")
    private String ML_URL;
    private final RestTemplate restTemplate = new RestTemplate();

    public NoShowPredictionResponse predict(NoShowPredictionRequest request) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<NoShowPredictionRequest> entity =
                new HttpEntity<>(request, headers);

        ResponseEntity<NoShowPredictionResponse> response =
                restTemplate.postForEntity(
                        ML_URL,
                        entity,
                        NoShowPredictionResponse.class
                );

        return response.getBody();
    }

}
