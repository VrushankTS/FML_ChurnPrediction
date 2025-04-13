import os
import pickle
import numpy as np
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware  

def load_assets():
    with open("models/xgb_model.pkl", "rb") as f:
        xgb_model = pickle.load(f)
    with open("models/scaler_xgb.pkl", "rb") as f:
        scaler_xgb = pickle.load(f)
    with open("models/kmeans_model.pkl", "rb") as f:
        kmeans_model = pickle.load(f)
    with open("models/scaler_kmeans.pkl", "rb") as f:
        scaler_kmeans = pickle.load(f)
    with open("models/num_imputer.pkl", "rb") as f:
        num_imputer = pickle.load(f)
    with open("models/cat_imputer.pkl", "rb") as f:
        cat_imputer = pickle.load(f)
    with open("models/label_encoders.pkl", "rb") as f:
        label_encoders = pickle.load(f)
    with open("models/x_all_columns.pkl", "rb") as f:
        x_all_columns = pickle.load(f)
    with open("models/important_features.pkl", "rb") as f:
        important_features = pickle.load(f)
    with open("models/numerical_features.pkl", "rb") as f:
        numerical_features = pickle.load(f)
    with open("models/categorical_features.pkl", "rb") as f:
        categorical_features = pickle.load(f)

    return {
        'xgb_model': xgb_model,
        'scaler_xgb': scaler_xgb,
        'kmeans_model': kmeans_model,
        'scaler_kmeans': scaler_kmeans,
        'num_imputer': num_imputer,
        'cat_imputer': cat_imputer,
        'label_encoders': label_encoders,
        'x_all_columns': x_all_columns,
        'important_features': important_features,
        'numerical_features': numerical_features,
        'categorical_features': categorical_features
    }

def predict_single_row_dict(row_dict, assets):
    row_df = pd.DataFrame([row_dict])
    row_df = row_df.replace("", np.nan)
    numerical = assets['numerical_features']
    categorical = assets['categorical_features']
    num_features_present = [col for col in numerical if col in row_df.columns]
    if num_features_present:
        row_df[num_features_present] = row_df[num_features_present].apply(
            pd.to_numeric, errors="coerce"
        )
        row_df[num_features_present] = assets['num_imputer'].transform(row_df[num_features_present])
    cat_features_present = [col for col in categorical if col in row_df.columns]
    if cat_features_present:
        row_df[cat_features_present] = assets['cat_imputer'].transform(row_df[cat_features_present])
        for col in cat_features_present:
            if col in assets['label_encoders']:
                row_df[col] = assets['label_encoders'][col].transform(row_df[col])
    for col in assets['x_all_columns']:
        if col not in row_df.columns:
            row_df[col] = 0  
    X_input = row_df[assets['x_all_columns']]
    X_input_scaled = assets['scaler_xgb'].transform(X_input)
    churn_pred = assets['xgb_model'].predict(X_input_scaled)[0]
    for col in assets['important_features']:
        if col not in row_df.columns:
            row_df[col] = 0
    X_cluster_input = row_df[assets['important_features']]
    X_cluster_scaled = assets['scaler_kmeans'].transform(X_cluster_input)
    cluster_pred = assets['kmeans_model'].predict(X_cluster_scaled)[0] + 1  
    return {"PredictedChurn": int(churn_pred), "ClusterGroup": int(cluster_pred)}

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

assets = load_assets()

class DataRow(BaseModel):
    class Config:
        extra = "allow"

@app.post("/predict")
async def predict(rows: List[DataRow]):
    results = []
    
    for row in rows:
        row_dict = row.dict()
        prediction = predict_single_row_dict(row_dict, assets)
        results.append(prediction)
    return {"predictions": results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
