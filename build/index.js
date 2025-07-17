"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const google_cloud_logger_1 = require("./logger/google.cloud.logger");
const singleRateData = {
    baseCurrency: 'USD',
    currency: 'NGN',
    rate: 1000,
    preferences: {
        newsletter: true,
        notifications: false
    },
    timestamp: new Date().toISOString()
};
const multipleRatesData = [
    {
        baseCurrency: 'USD',
        currency: 'NGN',
        rate: 1000,
        preferences: {
            newsletter: true,
            notifications: false
        },
        timestamp: new Date().toISOString()
    },
    {
        baseCurrency: 'EUR',
        currency: 'NGN',
        rate: 1100,
        preferences: {
            newsletter: true,
            notifications: true
        },
        timestamp: new Date().toISOString()
    },
    {
        baseCurrency: 'GBP',
        currency: 'NGN',
        rate: 1200,
        preferences: {
            newsletter: false,
            notifications: true
        },
        timestamp: new Date().toISOString()
    }
];
(0, google_cloud_logger_1.LogInfo)("todays rate", multipleRatesData);
//sendMail(multipleRatesData,"dil.anikamadu@gmail.com" )
