import Constants from "expo-constants";

const ENV = {
    dev: {
        apiUrl: '192.168.137.1:8081/API',
    },
    staging: {
        apiUrl: "3.91.247.85:8081/API",
    },
    prod: {
        apiUrl: "3.91.247.85:8081/API",
    }
};

const getEnvVars = (env = Constants.manifest.releaseChannel) => {
    // What is __DEV__ ?
    // This variable is set to true when react-native is running in Dev mode.
    // __DEV__ is true when run locally, but false when published.
    if (__DEV__) {
        return ENV.dev;
    } else if (env === 'staging') {
        return ENV.staging;
    } else if (env === 'prod') {
        return ENV.prod;
    }
};

export default getEnvVars;
