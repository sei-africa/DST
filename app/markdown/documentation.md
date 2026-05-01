[TOC]

separate_toc_tag

## Introduction

This document gives a brief overview on how to use the REST API service Data Sharing Tool (DST) which allows users to extract and download data from ENACTS datasets.

## ENACTS Datasets

There are 3 main ENACTS datasets

| Datasets | Description | Update | Usage |
| :------- | :------ | :------- | :------- |
|__ALL__ <br> *__All stations__* | This type of dataset is generated using all available stations at the MetServices (synoptic, climatological, agro, rain gauge, AWS, ...).<br> Many MetServices have difficulty gathering observation data from the staions to the headquarter, it may take months or even more years for the observation data (usually on paper records) to arrive at the headquarter. So, when all the observation data from all available staions are collected  at the headquarter, this dataset can be updated. | every one month, 6 months or every year,<br> ... | Analysis<br>Climatologies<br>...|
|__MON__ <br> *__Monitoring__* | This dataset is generated using all available station data every day, at the end of the pentad or dekad.<br>It is for monitoring purposes and generally used to compute the SPI. | every day , 5-days (pentad), 10-days (dekad) or monthly | Monitoring |
|__CLM__ <br> *__Climatology__* | This dataset is generated using stations having a long series of data (at least 15 years of observation data) | every 1, 5 or 10 years | Climatologies<br>Normal |

## Authorization
The DST operates by assigning each authorized user a unique, time-limited login credential (ID and password), granting access exclusively to the datasets that the NMHS has explicitly approved for sharing. This approach ensures that data access is both targeted and secure, enabling NMHS to tailor access permissions based on user roles, project needs, or institutional agreements.

Each user receives an "__username__" and "__password__" from the NMHS that allows the user to login into this website. You can get your API key from your profile when you logged in.

There are many ways you can authenticate for each API request.

* __Query Parameters__: you can include the API key in your query parameters with the key *__apiKey__* when you are using an API URL request. For example, 

```bash
http://baseURL/endpoint?apiKey=3B4aOUVpCztMzjDS&dataset=ALL&...
```

* __Request Body Parameters__: when you download the data through an API request code, the API key can be sent within the request body with the key *__apiKey__*. For example,

```python
# Python code
params = {
    "apiKey": "3B4aOUVpCztMzjDS",
    "dataset": "ALL",
    ...
    }
```

```r
# R code
params <- list(
    apiKey = "3B4aOUVpCztMzjDS",
    dataset = "ALL",
    ...
    )
```

* __Header Parameters__: you also can pass the API key in the header. Each request to the API should have an "__Authorization__" header that contains an authentication scheme "__Apikey__" or with API gateway "__X-API-Key__". For example,

```python
## Python code
# Apikey authentication scheme
headers = { "Authorization": "Apikey 3B4aOUVpCztMzjDS"}
# API gateway X-API-Key 
headers = {"X-API-Key": "3B4aOUVpCztMzjDS"}
```

```r
## R code using the package 'httr'
library(httr)
# Apikey authentication scheme
headers <- add_headers(Authorization = "Apikey 3B4aOUVpCztMzjDS")
# API gateway X-API-Key 
headers <- add_headers("X-API-Key" = "3B4aOUVpCztMzjDS")
```

```curl
## using cURL
curl -X GET "http://baseURL/endpoint" \
-H "X-API-Key: 3B4aOUVpCztMzjDS"
```

## ENDPOINTS

### API information: `info`

This endpoint provides general information about the DST service and is accessible via a GET request.

```{ .endpoint-def }
/info
```

It returns a JSON format.

### Datasets information: `dataset_info`


The endpoint can be used with a **GET** request. It allows you to make a request in path parameters

```{ .endpoint-def }
/dataset_info/{dataset}/{temporal resolution}/{variable}
```

__Example__:

- Getting all datasets information : <span class="endpoint-ex">/dataset_info</span>
- Getting one datasets information: <span class="endpoint-ex">
/dataset_info/all</span>
- Getting a specific temporal resolution: <span class="endpoint-ex">/dataset_info/mon/dekadal</span>
- Getting a specific variable: <span class="endpoint-ex">/dataset_info/all/daily/precip</span>

Following the request structure of the path parameters, here is how to send the request to get information of daily precipitation for ALL dataset:

```url
http://baseURL/dataset_info/all/daily/precip
```

The output is returned in JSON format as follows:

```json
{
    "dataset_name": "ALL",
    "dataset_longname": "Analysis datasets",
    "variable_name": "precip",
    "variable_longname": "Daily rainfall",
    "variable_units": "mm",
    "missing_value": -99,
    "temporal_resolution": "daily",
    "temporal_coverage":
    {
        "start": "1983-01-01",
        "end": "2023-10-31"
    },
    "spatial_resolution":
    {
        "lon": 0.0375,
        "lat": 0.0375
    },
    "spatial_coverage":
    {
        "minlon": 32.625,
        "maxlon": 36.0,
        "minlat": -17.2875,
        "maxlat": -9.3375
    }
}
```

### Downloading data: `download_raw_data`

The endpoint can be used with a **GET**  and **POST** requests. It allows to extract data over a specifed geometry and download data at a different time scales in different output formats.

#### <u>Common request parameters</u>

- **The API key**:

| Key | Value | Type |
| :------- | :------ | :------- |
| **apiKey** | user API key | string |


__Example__:

API URL request

```url
http://baseURL/download_raw_data?apiKey=wxXvVw8RBRbLmnCv&...
```

GET and POST request parameters

```python
params = {
	'apiKey': 'wxXvVw8RBRbLmnCv',
	...
}
```

- **Dataset selection**:

| Key | Values | Type |
| :------- | :------ | :------- |
| **dataset** | `'ALL'`, `'MON'` | string |

__Example__:

API URL request

```url
http://baseURL/download_raw_data?apiKey=wxXvVw8RBRbLmnCv&dataset=ALL&...
```

GET and POST request parameters

```python
params = {
	'apiKey': 'wxXvVw8RBRbLmnCv',
	'dataset': 'ALL',
	...
}
```

- **Temporal resolution**:

| Key | Values | Type |
| :------- | :------ | :------- |
| **temporalRes** | `'daily'`, `'dekadal'`, `'monthly'`, `'seasonal'`, `'annual'` | string |

__Example__:

API URL request

```url
http://baseURL/download_raw_data?apiKey=wxXvVw8RBRbLmnCv&dataset=ALL&temporalRes=monthly&...
```

GET and POST request parameters

```python
params = {
	'apiKey': 'wxXvVw8RBRbLmnCv',
	'dataset': 'ALL',
	'temporalRes': 'monthly',
	...
}
```

- **Variable selection**:

| Key | Values | Type |
| :------- | :------ | :------- |
| **variable** | `'precip'`: precipitation <br> `'tmax'`: maximum temperature <br> `'tmin'`: minimum temperature | string |

__Example__:

API URL request

```url
http://baseURL/download_raw_data?apiKey=wxXvVw8RBRbLmnCv&dataset=ALL&temporalRes=monthly&variable=precip&...
```

GET and POST request parameters

```python
params = {
	'apiKey': 'wxXvVw8RBRbLmnCv',
	'dataset': 'ALL',
	'temporalRes': 'monthly',
	'variable': 'precip',
	...
}
```

- **Data extraction support**:

| Key | Values | Type |
| :------- | :------ | :------- |
| **geomExtract** | `'points'`: extraction over a list of points <br> `'rectangle'`: extraction over a rectangle <br> `'polygons'`: extraction over a list of polygons <br> `'geojson'`: extraction over a geometries (_Point_, _Polygon_ or _MultiPolygon_) from a GeoJSON data <br> `'original'`: download the original grid of the data | string |

__Example__:

API URL request

```url
http://baseURL/download_raw_data?apiKey=wxXvVw8RBRbLmnCv&dataset=ALL&temporalRes=monthly&variable=precip&geomExtract=points&...
```

GET and POST request parameters

```python
params = {
	'apiKey': 'wxXvVw8RBRbLmnCv',
	'dataset': 'ALL',
	'temporalRes': 'monthly',
	'variable': 'precip',
	'geomExtract': 'points',
	...
}
```

#### <u>Date parameters</u>

The request parameters for date depend on the type of extraction and the output format. It can be classified into 2 separate categories: _spatial points_ and _gridded_ data.

I. **Spatial points data**

- **Date range**:

 Key | Values | Type |
| :------- | :------ | :------- |
| **startDate** | Start date from which the data will be downloaded | string or integer |
| **endDate** | End date | string or integer |

> **Date format:** <br>
> __daily__: `YYYY-MM-DD`, where `YYYY` is the year, `MM` the month and `DD` the day, e.g., 2024-03-31 <br>
> __dekadal__: `YYYY-MM-D`, where `YYYY` is the year, `MM` the month and `D` the dekad. There are 3 dekads in a calendar month. The dekad must be 1, 2 or 3; dekad 1 (days from the 1st to 10th), dekad 2 (11th to 20th) and dekad 3 (21st to the end of the month), e.g., 2024-03-3 <br>
> __monthly__: `YYYY-MM`, where `YYYY` is the year and `MM` the month, e.g., 2024-03 <br>
> __seasonal__: `YYYY`, e.g., 2025 <br>
> __annual__: `YYYY`, e.g., 2020 <br>

- **Additional parameters for seasonal data**:

 Key | Values | Type |
| :------- | :------ | :------- |
| **seasStart** | Starting month of the season, `from 1 to 12` | integer |
| **seasLength** | Length of the season, must be `from 2 to 12` | integer |


__Example__:


1\.  Downloading seasonal minimum temperature data from monitoring dataset, for the season June-July-August starting from 1991 to 2020 over a list of points.

API URL request

```url
http://baseURL/download_raw_data?apiKey=wxXvVw8RBRbLmnCv&dataset=MON&temporalRes=seasonal&variable=tmin&geomExtract=points&startDate=1991&endDate=2020&seasStart=6&seasLength=3&...
```

GET and POST request parameters

```python
params = {
	'apiKey': 'wxXvVw8RBRbLmnCv',
	'dataset': 'MON',
	'temporalRes': 'seasonal',
	'variable': 'tmin',
	'geomExtract': 'points',
	'startDate': 1991,
	'endDate': 2020,
	'seasStart': 6,
	'seasLength': 3,
	...
}
```

2\. Downloading dekadal precipitation data from ALL dataset, from the first dekad of January 2024 to the third dekad of March 2024 spatially averaged over a recatngle.

API URL request

```url
http://baseURL/download_raw_data?apiKey=wxXvVw8RBRbLmnCv&dataset=ALL&temporalRes=dekadal&variable=precip&geomExtract=rectangle&startDate=2024-01-1&endDate=2024-03-3&spatialAvg=true&...
```

GET and POST request parameters

```python
params = {
	'apiKey': 'wxXvVw8RBRbLmnCv',
	'dataset': 'ALL',
	'temporalRes': 'dekadal',
	'variable': 'precip',
	'geomExtract': 'rectangle',
	'startDate': '2024-01-1',
	'endDate': '2024-03-3',
	'spatialAvg': True
	...
}
```

II. **Gridded data**

The data is separately downloaded for each date, only one parameter `Date` is used.

| Key | Value | Type |
| :------- | :------ | :------- |
| **Date** | Date to download the data | string or integer |

> **Date format:** <br>
> __daily__: `YYYY-MM-DD`, where `YYYY` is the year, `MM` the month and `DD` the day, e.g., 2024-03-31 <br>
> __dekadal__: `YYYY-MM-D`, where `YYYY` is the year, `MM` the month and `D` the dekad, e.g., 2024-03-3 <br>
> __monthly__: `YYYY-MM`, where `YYYY` is the year and `MM` the month, e.g., 2024-03 <br>
> __seasonal__: `YYYY-MM_YYYY-MM`, where the first `YYYY-MM` is the start year and month of the season, the second `YYYY-MM` is the end year and month, e.g., 2023-12_2024-02 for the season starting from December 2023 to February 2024 <br>
> __annual__: `YYYY`, e.g., 2020 <br>

__Example__:

Downloading monthly precipitation data from ALL dataset for December 2020 over a recatngle.

API URL request

```url
http://baseURL/download_raw_data?apiKey=wxXvVw8RBRbLmnCv&dataset=ALL&temporalRes=monthly&variable=precip&geomExtract=rectangle&Date=2020-12&...
```

GET and POST request parameters

```python
params = {
	'apiKey': 'wxXvVw8RBRbLmnCv',
	'dataset': 'ALL',
	'temporalRes': 'monthly',
	'variable': 'precip',
	'geomExtract': 'rectangle',
	'Date': '2020-12',
	...
}
```

#### <u>Output formart</u>

The format of the downloaded data depends on the type of the data: _spatial points data_ or _gridded data_.

I. **Spatial points data**

| Key | Values | Type |
| :------- | :------ | :------- |
| **outFormat** | `'CSV-CDT-Format'`: available for the following requests <ul><li>geomExtract=points</li><li>geomExtract=rectangle&spatialAvg=true</li><li>geomExtract=polygons&spatialAvg=true</li></ul> `'JSON-Format'`: available for the following requests <ul><li>geomExtract=points</li><li>geomExtract=rectangle&spatialAvg=true</li><li>geomExtract=polygons&spatialAvg=true</li><li>geomExtract=geojson</li></ul> | string |

- <u>**Output format**</u>: `CSV-CDT-Format`

The downloaded data is in comma-separated value (CSV) format . The structure of the table is as follows:

* first row: the ID or name of the points
* second row: the longitude of the points
* third row: the latitude of the points
* the data start from the forth row
* first column: the date

The block below shows an example of the contents of `CSV-CDT-Format` format

```
Name,Blantyre,Chileka,Lilongwe,Mzuzu
Longitude,35.005219,34.970339,33.778892,34.002784
Latitude,-15.790527,-15.680623,-13.972258,-11.443639
202307,0.00,0.00,0.00,0.00
202308,0.00,0.00,0.00,0.00
202309,0.00,0.00,0.00,0.00
202310,45.80,43.92,45.70,21.73
202311,110.68,80.80,35.28,117.09
202312,172.06,121.97,154.60,97.50
202401,260.44,250.86,245.07,318.51
```

>  **NOTE:** the coordinate of spatially averaged data over a rectange (request: `geomExtract=rectangle&spatialAvg=true`) is the center of the recatngle.<br>
>  The coordinates of spatially averaged data over a polygons (request: `geomExtract=polygons&spatialAvg=true`) are the centroid of each polygon.


- <u>**Output format**</u>: `JSON-Format`

The JSON format has the following keys:

* __Dates__: a list of dates
* __Data__: a list of objects containing the data for the points, saptially averaged data over the polygons, spatially averaged data over a rectangle, or points and spatially averaged data over the polygons from a GeoJSON data. Each object has the following keys:
	- *__Name__*: the name of the point or polygon
	- *__Longitude__*: the longitude of the point or longitude of the centroid for a polygon
	- *__Latitude__*: the latitude of the point or latitude of the centroid for a polygon
	- *__Values__*: a list containing the variable data
	- *__Type__*: for GeoJSON, the geometry type
* __VariableName__: the variable name
* __VariableUnits__: the variable units
* __Missing__: the missing values code

__Examples__:

1\. Extracting data over a list of points

*__Request__*:

```url
http://baseURL/download_raw_data?apiKey=wxXvVw8RBRbLmnCv&dataset=MON&temporalRes=monthly&variable=precip&startDate=2023-07&endDate=2024-01&geomExtract=points&pointsSource=user&pointsFile=malawi_loc.csv&outFormat=JSON-Format
```

*__Output__*:

```json
{
    "Dates": ["202307", "202308", "202309", "202310", "202311", "202312", "202401"],
    "Data": [
    {
        "Name": "Blantyre",
        "Longitude": 35.005219,
        "Latitude": -15.790527,
        "Values": [0.0, 0.0, 0.0, 45.8, 110.68, 172.06, 260.44]
    },
    {
        "Name": "Chileka",
        "Longitude": 34.970339,
        "Latitude": -15.680623,
        "Values": [0.0, 0.0, 0.0, 43.92, 80.8, 121.97, 250.86]
    },
    {
        "Name": "Lilongwe",
        "Longitude": 33.778892,
        "Latitude": -13.972258,
        "Values": [0.0, 0.0, 0.0, 45.7, 35.28, 154.6, 245.07]
    },
    {
        "Name": "Mzuzu",
        "Longitude": 34.002784,
        "Latitude": -11.443639,
        "Values": [0.0, 0.0, 0.0, 21.73, 117.09, 97.5, 318.51]
    }],
    "VariableName": "Monthly rainfall",
    "VariableUnits": "mm",
    "Missing": -99
}
```

2\. Extracting data using GeoJSON file

*__Request__*:

```url
http://baseURL/download_raw_data?apiKey=wxXvVw8RBRbLmnCv&dataset=MON&temporalRes=monthly&variable=precip&startDate=2023-07&endDate=2024-01&geomExtract=geojson&geojsonSource=user&geojsonFile=South_east_zone_with_facilities.geojson&geojsonField=name&outFormat=JSON-Format
```

*__Output__*:

```json
{
    "Dates": ["202307", "202308", "202309", "202310", "202311", "202312", "202401"],
    "Data": [
    {
        "Name": "Balaka-DHO",
        "Longitude": 35.056303,
        "Latitude": -15.032108,
        "Values": [0.0, 0.0, 0.0, 24.46, 44.25, 115.02, 218.19],
        "Type": "polygon"
    },
    {
        "Name": "Machinga-DHO",
        "Longitude": 35.566238,
        "Latitude": -14.939513,
        "Values": [0.0, 0.0, 0.0, 19.42, 38.94, 121.11, 208.25],
        "Type": "polygon"
    },
    {
        "Name": "Mangochi-DHO",
        "Longitude": 35.189438,
        "Latitude": -14.355784,
        "Values": [0.0, 0.0, 0.0, 18.61, 46.31, 88.12, 194.03],
        "Type": "polygon"
    },
    {
        "Name": "Mulanje-DHO",
        "Longitude": 35.509336,
        "Latitude": -15.932517,
        "Values": [0.0, 0.16, 0.0, 135.13, 71.34, 168.07, 354.63],
        "Type": "polygon"
    },
    {
        "Name": "Phalombe-DHO",
        "Longitude": 35.690062,
        "Latitude": -15.66619,
        "Values": [0.0, 0.02, 0.0, 133.05, 42.23, 142.33, 287.36],
        "Type": "polygon"
    },
    {
        "Name": "Zomba-DHO",
        "Longitude": 35.429713,
        "Latitude": -15.394558,
        "Values": [0.0, 0.0, 0.0, 42.12, 40.12, 162.76, 261.94],
        "Type": "polygon"
    },
    {
        "Name": "Ahi Private Clinic",
        "Longitude": 35.3223,
        "Latitude": -15.38361,
        "Values": [0.0, 0.0, 0.0, 27.98, 52.9, 171.29, 297.06],
        "Type": "point"
    },
    {
        "Name": "Chiringa Maternity",
        "Longitude": 35.76965,
        "Latitude": -15.77213,
        "Values": [0.0, 0.0, 0.0, 143.92, 49.43, 160.49, 301.04],
        "Type": "point"
    },
    {
        "Name": "Nambiti II Health Centre",
        "Longitude": 35.76392,
        "Latitude": -15.80293,
        "Values": [0.0, 0.0, 0.0, 143.92, 49.43, 160.49, 301.04],
        "Type": "point"
    }],
    "VariableName": "Monthly rainfall",
    "VariableUnits": "mm",
    "Missing": -99
}
```

II. **Gridded data**

| Key | Values | Type |
| :------- | :------ | :------- |
| **outFormat** | `netCDF-Format`, `CSV-Column-Format` or `JSON-Format` available for the following requests <ul><li>geomExtract=original</li><li>geomExtract=rectangle&spatialAvg=false</li><li>geomExtract=polygons&spatialAvg=false</li></ul> | string |

- <u>**Output format**</u>: `netCDF-Format`

*__Request__*:

```url
http://baseURL/download_raw_data?apiKey=wxXvVw8RBRbLmnCv&dataset=MON&temporalRes=monthly&variable=precip&geomExtract=rectangle&minLon=33.266602&maxLon=34.486084&minLat=-13.794277&maxLat=-13.238993&outFormat=netCDF-Format&Date=2024-01
```

*__Information about the netCDF file__*:

```info
File precip_monthly_2024-01.nc (NC_FORMAT_NETCDF4):

     1 variables (excluding dimension variables):
        float precip[Lon,Lat,Time]   (Chunking: [32,14,1])  (Compression: shuffle,level 6)
            long_name: Monthly rainfall
            units: mm
            missing_value: -99

     3 dimensions:
        Time  Size:1   *** is unlimited ***
            long_name: Time
            units: months since 1970-01-01
            calendar: standard
            axis: T
        Lat  Size:14
            standard_name: latitude
            long_name: Latitude
            units: degrees_north
            axis: Y
        Lon  Size:32
            standard_name: longitude
            long_name: Longitude
            units: degrees_east
            axis: X
```

- <u>**Output format**</u>: `CSV-Column-Format`

The downloaded data is in comma-separated value (CSV) format . The structure of the table is as follows:

* first column: the latitude of the grid point
* second column: the longitude of the grid point
* third column: the value of the variable

The following request returns a file named _**precip\_monthly\_2024-01.csv**_

```url
http://baseURL/download_raw_data?apiKey=wxXvVw8RBRbLmnCv&dataset=MON&temporalRes=monthly&variable=precip&geomExtract=rectangle&minLon=33.266602&maxLon=34.486084&minLat=-13.794277&maxLat=-13.238993&outFormat=CSV-Column-Format&Date=2024-01
```

The block below shows the contents of _**precip\_monthly\_2024-01.csv**_

```
Latitude,Longitude,precip
33.3,-13.7625,306.01
33.3375,-13.7625,298.05
33.375,-13.7625,291.22
33.4125,-13.7625,279.14
33.45,-13.7625,282.42
33.4875,-13.7625,280.43
33.525,-13.7625,283.61
33.5625,-13.7625,288.53
33.6,-13.7625,279.11
...
```

- <u>**Output format**</u>: `JSON-Format`

The JSON format has the following keys:

* __Date__: the date of the data
* __Latitude__: a list of latitude for each grid point
* __Longitude__: a list of longitude for each grid point
* __Data__: a list of lists containg the data
* __Dimensions__: an object containing the dimensions
* __VariableName__: the variable name
* __VariableUnits__: the variable units
* __Missing__: the missing values code

__Example__:

*__Request__*:

```url
http://baseURL/download_raw_data?apiKey=wxXvVw8RBRbLmnCv&dataset=MON&temporalRes=monthly&variable=precip&geomExtract=rectangle&minLon=33.266602&maxLon=34.486084&minLat=-13.794277&maxLat=-13.238993&outFormat=JSON-Format&Date=2024-01
```

*__Output__*:

```json
{
    "Date": "2024-01",
    "Latitude": [-13.7625, -13.725, -13.6875, -13.65, -13.6125, -13.575, -13.5375, -13.5, -13.4625, -13.425, -13.3875, -13.35, -13.3125, -13.275],
    "Longitude": [33.3, 33.3375, 33.375, 33.4125, 33.45, 33.4875, 33.525, 33.5625, 33.6, 33.6375, 33.675, 33.7125, 33.75, 33.7875, 33.825, 33.8625, 33.9, 33.9375, 33.975, 34.0125, 34.05, 34.0875, 34.125, 34.1625, 34.2, 34.2375, 34.275, 34.3125, 34.35, 34.3875, 34.425, 34.4625],
    "Data": [
        [306.01, 298.05, 291.22, 279.14, 282.42, 280.43, 283.61, 288.53, 279.11, 274.12, 279.17, 278.09, 270.99, 281.28, 287.56, 301.86, 316.79, 336.29, 343.41, 349.35, 347.41, 376.46, 387.46, 378.83, 372.61, 356.98, 358.32, 354.47, 368.95, 379.09, 369.57, 361.16],
        [318.47, 314.29, 304.4, 301.72, 297.99, 292.93, 291.29, 301.02, 286.2, 285.47, 281.09, 279.55, 287.06, 295.04, 300.02, 315.02, 334.72, 342.98, 356.81, 369.61, 373.33, 379.32, 389.18, 386.42, 383.03, 368.26, 363.02, 357.7, 359.9, 366.21, 365.25, 362.92],
        [334.65, 319.4, 309.93, 304.97, 297.83, 298.54, 296.53, 285.53, 285.04, 281.04, 281.13, 279.91, 293.78, 300.09, 303.03, 315.64, 327.57, 335.02, 354.71, 374.36, 373.62, 372.95, 377.94, 377.09, 372.07, 366.81, 348.04, 355.63, 351.06, 362.66, 360.34, 376.57],
        [335.37, 322.67, 307.36, 302.74, 299.84, 293.87, 297.02, 296.55, 274.32, 276.27, 273.03, 280.72, 293.33, 291.7, 299.98, 315.55, 333.11, 347.0, 347.95, 349.08, 365.85, 361.6, 365.71, 354.51, 354.11, 351.22, 345.52, 350.78, 360.93, 382.07, 390.32, 404.37],
        [333.98, 320.76, 314.64, 308.05, 303.29, 293.31, 269.18, 259.74, 253.13, 257.2, 257.95, 262.96, 277.26, 284.46, 300.58, 321.62, 328.83, 335.52, 339.77, 344.81, 354.38, 340.17, 343.46, 335.61, 335.48, 341.62, 340.96, 358.75, 379.5, 401.59, 418.52, 426.16],
        [343.94, 323.14, 311.89, 310.26, 303.67, 294.16, 262.91, 248.48, 242.11, 242.23, 244.69, 257.61, 265.16, 269.6, 288.3, 304.32, 316.58, 328.08, 333.47, 343.67, 352.08, 340.64, 345.57, 332.38, 328.62, 330.38, 343.41, 370.99, 392.35, 404.92, 423.76, 423.77],
        [355.04, 335.14, 318.66, 315.26, 307.6, 288.43, 264.21, 254.04, 251.84, 249.41, 251.53, 254.32, 261.21, 270.21, 286.34, 302.32, 313.67, 329.05, 330.89, 334.28, 345.54, 343.38, 345.71, 337.65, 331.31, 330.97, 351.2, 388.94, 405.8, 414.18, 413.58, 410.1],
        [361.85, 343.54, 333.63, 330.7, 324.61, 295.07, 269.71, 269.75, 267.12, 261.73, 257.7, 258.37, 263.35, 274.4, 294.43, 307.93, 320.72, 338.33, 338.38, 350.86, 336.91, 347.93, 351.1, 343.97, 342.91, 344.63, 365.55, 407.09, 400.52, 413.01, 414.22, 404.64],
        [351.89, 347.99, 337.95, 335.77, 320.29, 289.0, 278.7, 274.77, 272.32, 262.22, 266.57, 273.08, 288.14, 298.09, 309.62, 315.2, 325.93, 343.99, 360.63, 356.16, 353.54, 347.8, 353.17, 351.04, 356.67, 360.83, 390.1, 398.33, 403.07, 401.33, 406.35, 399.8],
        [363.75, 353.39, 346.62, 337.72, 311.33, 298.88, 294.39, 287.32, 284.68, 273.76, 273.15, 283.48, 299.58, 304.36, 316.36, 330.99, 349.86, 363.54, 379.62, 365.54, 365.3, 351.51, 364.68, 360.47, 362.79, 359.63, 394.8, 398.86, 399.03, 399.66, 398.61, 396.53],
        [366.17, 352.77, 348.63, 339.47, 329.42, 311.63, 311.67, 300.67, 289.98, 283.17, 282.01, 292.31, 316.65, 320.05, 324.24, 343.85, 360.48, 368.21, 375.39, 370.97, 370.46, 346.67, 346.76, 343.52, 345.42, 357.87, 380.29, 400.51, 399.28, 397.63, 396.96, 389.46],
        [374.31, 367.75, 358.38, 341.95, 334.78, 310.21, 310.13, 304.11, 297.29, 284.88, 282.95, 293.41, 325.72, 333.05, 341.81, 358.55, 367.13, 376.88, 380.65, 369.4, 353.25, 348.66, 342.69, 340.08, 349.31, 358.92, 382.16, 392.05, 398.69, 390.21, 387.17, 383.3],
        [376.62, 368.06, 357.36, 346.26, 329.52, 310.36, 303.31, 301.74, 296.23, 285.65, 283.84, 313.14, 324.07, 339.14, 352.59, 370.84, 377.31, 373.28, 363.14, 365.35, 355.25, 361.65, 350.41, 347.15, 343.4, 357.95, 375.95, 386.94, 397.24, 392.96, 382.14, 386.65],
        [379.49, 364.65, 350.02, 340.27, 328.51, 307.33, 307.18, 312.99, 306.88, 300.01, 301.6, 324.22, 330.03, 346.19, 360.17, 379.99, 390.56, 387.46, 379.71, 378.07, 377.48, 367.77, 364.47, 352.34, 346.53, 355.15, 372.61, 387.7, 400.6, 399.87, 393.23, 386.36]
    ],
    "Dimensions":
    {
        "Latitude": 14,
        "Longitude": 32
    },
    "VariableName": "Monthly rainfall",
    "VariableUnits": "mm",
    "Missing": -99.0
}
```

>  **NOTE:** a gridded data downloaded over a multiple polygons is zipped. By default, the file name is formatted like this `<variable>_<temporalRes>_<Date>.zip`. <br>
> The zip file is composed of the data of all selected polygons, the file name of each polygon has the format `<name of the polygon>_<variable>_<temporalRes>_<Date>.<extension depending on the output format>`

#### <u>Extraction over a list of points</u>

- **Source of the points data**:

| Key | Values | Type |
| :------- | :------ | :------- |
| **pointsSource** | `'user'`: the coordinates of the points are taken from user-uploaded CSV files <br> `'upload'`: the coordinates of the points are sent with a __POST__ request  | string |


> **NOTE:** If __pointsSource__ is `'user'`, you must first upload the CSV file containing the coordinates of the points in your profile from the menu **_My Account_** when you logged into your account from the website.
> The screenshot below shows an example of a list of user-uploaded CSV files

<center>
<img src="<<<<urlPrefix>>>>/static/images/user_mpoints_table.png" width="70%"/>
</center>

-  **Points from user uploaded CSV file** `pointsSource='user'`:

| Key | Value | Type |
| :------- | :------ | :------- |
| **pointsFile** | name of the CSV file containing the points coordinates from user uploaded CSV files | string |


__Example__:

API URL request

```url
http://baseURL/download_raw_data?apiKey=wxXvVw8RBRbLmnCv&dataset=ALL&temporalRes=monthly&variable=precip&startDate=2023-09&endDate=2023-10&geomExtract=points&pointsSource=user&pointsFile=malawi_loc.csv&...
```

GET and POST request parameters

```python
params = {
	'apiKey': 'wxXvVw8RBRbLmnCv',
	'dataset': 'ALL',
	'temporalRes': 'monthly',
	'variable': 'precip',
	'startDate': '2023-09',
	'endDate': '2023-10',
	'geomExtract': 'points',
	'pointsSource': 'user',
	'pointsFile': 'malawi_loc.csv',
	...
}
```


- **Points uploaded with POST method** `pointsSource='upload'`:
 
| Key | Values | Type |
| :------- | :------ | :------- |
| **pointsList** | list of points, the point is an object of format `{'loc': location name or id, 'lon': longitude, 'lat': latitude}`, the object keys must be (`loc`, `lon`, `lat`) | __Python__: a list of dictionaries <br> __R__: list of lists or a data.frame |

__Example of the list of points__

Python code

```python
list_points = [{'loc': 'Point_1', 'lon': 33.9, 'lat': -11.1}, {'loc': 'Point_2', 'lon': 33.7, 'lat': -12.8}, ...]
params = {
	'apiKey': 'wxXvVw8RBRbLmnCv',
	'dataset': 'ALL',
	'temporalRes': 'monthly',
	'variable': 'precip',
	'geomExtract': 'points',
	'pointsSource': 'upload',
	'pointsList': list_points,
	...
}
```
R code

```r
## list of lists
list_points <- list(list(loc='Point_1', lon=33.9, lat=-11.1), list(loc='Point_2', lon=33.7, lat=-12.8), ...)
params <- list(
	apiKey = 'wxXvVw8RBRbLmnCv',
	dataset = 'ALL',
	temporalRes = 'monthly',
	variable = 'precip',
	geomExtract = 'points',
	pointsSource = 'upload',
	pointsList = list_points,
	...
)
```
If the list of points is from a data.frame, the structure of the data should be 

```r
list_points <- data.frame(loc = c('Point_1', 'Point_2'), lon = c(33.9, 33.7), lat = c(-11.1, -12.8))

# loc		 lon   lat
# Point_1	 33.9 	-11.1
# Point_2	 33.7 	-12.8
```

- **Spatially average neighboring grid points**:

| Key | Values | Type |
| :------- | :------ | :------- |
| **padLon** | number of grid points along the longitude from the target point | integer |
| **padLat** | number of grid points along the latitude from the target point | integer |

> **NOTE:** **padLon** and **padLat** are optional and can be removed if their values are zeros.
> The following image shows an example for padding. If padLon=3 and padLat=3, the value at the target point will be the spatial average of the values of the grid points over the yellow area which is defined by 3 grids from the target point on both directions (negative and positive).

<center>
<img src="<<<<urlPrefix>>>>/static/images/padding_mpoints.png" width="30%"/>
</center>

__Example__:

Downloading seasonal minimum temperature data from monitoring dataset, for the season June-July-August starting from 1991 to 2020 over a list of points you uploaded into your account as a CSV file with the name `my_points_list.csv` and spatially average the data with padding (padLon=2 and padLad=2)

API URL request

```url
http://baseURL/download_raw_data?apiKey=wxXvVw8RBRbLmnCv&dataset=MON&temporalRes=seasonal&variable=tmin&geomExtract=points&pointsSource=user&pointsFile=my_points_list.csv&padLon=2&padLat=2&startDate=1991&endDate=2020&seasStart=6&seasLength=3&outFormat=JSON-Format
```

GET and POST request parameters

```python
params = {
	'apiKey': 'wxXvVw8RBRbLmnCv',
	'dataset': 'MON',
	'temporalRes': 'seasonal',
	'variable': 'tmin',
	'geomExtract': 'points',
	'pointsSource': 'user',
	'pointsFile': 'my_points_list.csv',
	'padLon': 2,
	'padLat': 2,
	'startDate': 1991,
	'endDate': 2020,
	'seasStart': 6,
	'seasLength': 3,
	'outFormat': 'JSON-Format'
}
```

#### <u>Extraction over a rectangle</u>

- **Coordinates of bounding box corners**:

| Key | Values | Type |
| :------- | :------ | :------- |
| **minLon** | minimum longitude | float |
| **maxLon** | maximum longitude | float |
| **minLat** | minimum latitude | float |
| **maxLat** | maximum latitude | float |


__Example__:

Downloading monthly minimum temperature data from ALL dataset, for September 2022 over the area Longitude(33.024902, 34.475098), Latitude(-13.579729, -13.066746), with output format netCDF.

API URL request

```url
http://baseURL/download_raw_data?apiKey=wxXvVw8RBRbLmnCv&dataset=ALL&temporalRes=monthly&variable=tmin&geomExtract=rectangle&minLon=33.024902&maxLon=34.475098&minLat=-13.579729&maxLat=-13.066746&outFormat=netCDF-Format&Date=2022-09
```

GET and POST request parameters

```python
params = {
	'apiKey': 'wxXvVw8RBRbLmnCv',
	'dataset': 'ALL',
	'temporalRes': 'monthly',
	'variable': 'tmin',
	'geomExtract': 'rectangle',
	'minLon': 33.024902,
	'maxLon': 34.475098,
	'minLat': -13.579729,
	'maxLat': -13.066746,
	'outFormat': 'netCDF-Format',
	'Date': '2022-09'
}
```

- **Spatially average data over the rectangle**:

The above request returns a gridded data, if you want to get the time series over the rectangle you need to spatially average the values of all grid points inside the rectangle by adding the following parameter

| Key | Values | Type |
| :------- | :------ | :------- |
| **spatialAvg** | `True`: spatially average data over the rectangle, returns a time series <br> `False`: get the gridded data over the rectangle| boolean <br> __Python__: `True` / `False` <br> __R__: `TRUE` / `FALSE` <br> __JavaScript__: `true` / `false`|

> **NOTE:** **spatialAvg** is optional and can be omitted if its value is `False`.

__Example__:

Downloading monthly minimum temperature time series from ALL dataset, from January 2022 to December 2022 over the area Longitude(33.024902, 34.475098), Latitude(-13.579729, -13.066746), with output format JSON.

API URL request

```url
http://baseURL/download_raw_data?apiKey=wxXvVw8RBRbLmnCv&dataset=ALL&temporalRes=monthly&variable=tmin&startDate=2022-01&endDate=2022-12&geomExtract=rectangle&minLon=33.024902&maxLon=34.475098&minLat=-13.579729&maxLat=-13.066746&spatialAvg=true&outFormat=JSON-Format
```

GET and POST request parameters

```python
params = {
	'apiKey': 'wxXvVw8RBRbLmnCv',
	'dataset': 'ALL',
	'temporalRes': 'monthly',
	'variable': 'tmin',
	'startDate': '2022-01',
	'endDate': '2022-12',
	'geomExtract': 'rectangle',
	'minLon': 33.024902,
	'maxLon': 34.475098,
	'minLat': -13.579729,
	'maxLat': -13.066746,
	'spatialAvg': True,
	'outFormat': 'JSON-Format'
}
```

#### <u>Extraction using GeoJSON data</u>

The coordinates in the GeoJSON must EPSG:4326 (WGS84). The geometry types must __Point__, __Polygon__ or __MultiPolygon__. You can have one or multiple geometry types in one file.

Below is an example of a GeoJSON data structure

```json
{
    "type": "FeatureCollection",
    "features": [
    {
        "type": "Feature",
        "geometry":
        {
            "type": "Point",
            "coordinates": [35.3223, -15.38361]
        },
        "properties":
        {
            "type": "Point",
            "name": "Ahi Private Clinic",
            .......
        }
    },
    {
        "type": "Feature",
        "geometry":
        {
            "type": "Polygon",
            "coordinates": [
                [
                    [34.8341, -15.2765],
                    [34.835, -15.2762],

                    .......

                    [34.8327, -15.2769],
                    [34.8341, -15.2765]
                ]
            ]
        },
        "properties":
        {
            "type": "Polygon",
            "name": "Balaka-DHO",
            .......
        }
    },
    { 
        .......... 
    },

    ..........
    ]
}  
```

- **Source of GeoJSON data**:

| Key | Values | Type |
| :------- | :------ | :------- |
| **geojsonSource** | `'user'`: the GeoJSON data is taken from user-uploaded GeoJSON file <br> `'upload'`: the GeoJSON data is sent with a __POST__ request  | string |


> **NOTE:** If __geojsonSource__ is `'user'`, you must first upload the GeoJSON file containing the geometry to be used into your profile from the menu **_My Account_** when you logged into your account from the website.
> The screenshot below shows an example of a list of user-uploaded GeoJSON files

<center>
<img src="<<<<urlPrefix>>>>/static/images/user_geojson_table.png" width="70%"/>
</center>

-  **Get geometry from user uploaded GeoJSON file** `geojsonSource='user'`:

| Key | Value | Type |
| :------- | :------ | :------- |
| **geojsonFile** | name of the GeoJSON file from user uploaded GeoJSON file, containing the geometries to be used to extract the data | string |


__Example__:

API URL request

```url
http://baseURL/download_raw_data?apiKey=wxXvVw8RBRbLmnCv&dataset=ALL&temporalRes=monthly&variable=precip&startDate=2023-09&endDate=2023-10&geomExtract=geojson&geojsonSource=user&geojsonFile=Zomba_facilities.geojson&...
```

GET and POST request parameters

```python
params = {
	'apiKey': 'wxXvVw8RBRbLmnCv',
	'dataset': 'ALL',
	'temporalRes': 'monthly',
	'variable': 'precip',
	'startDate': '2023-09',
	'endDate': '2023-10',
	'geomExtract': 'geojson',
	'geojsonSource': 'user',
	'geojsonFile': 'Zomba_facilities.geojson',
	...
}
```

- **GeoJSON data send with POST request** `geojsonSource='upload'`:
 
| Key | Values | Type |
| :------- | :------ | :------- |
| **geojsonData** | the geojson data containing the geometry to be used to extract the variable | json |

__Example__:

Python code

```python
import geopandas as gpd

geojson_file_path = 'path/to/your/file.geojson'
geojson_data = gpd.read_file(geojson_file_path)

params = {
	'apiKey': 'wxXvVw8RBRbLmnCv',
	'dataset': 'ALL',
	'temporalRes': 'monthly',
	'variable': 'precip',
	'startDate': '2023-09',
	'endDate': '2023-10',
	'geomExtract': 'geojson',
	'geojsonSource': 'upload',
	'geojsonData': geojson_data,
	...
}
```

R code

```r
library(sf)

geojson_file_path <- 'path/to/your/file.geojson'
geojson_data <- st_read(geojson_file_path)

params <- list(
	apiKey = 'wxXvVw8RBRbLmnCv',
	dataset = 'ALL',
	temporalRes = 'monthly',
	variable = 'precip',
	startDate = '2023-09',
	endDate = '2023-10',
	geomExtract = 'geojson',
	geojsonSource = 'upload',
	geojsonData = geojson_data,
	...
)
```

- **GeoJSON properties**:

| Key | Value | Type |
| :------- | :------ | :------- |
| **geojsonField** | the key/field from the properties of a Feature object to be used to extract the variable | string |

__Example__:

Let's say we have the following GeoJSON data, from a file named `malawi_watershed.geojson`

```json
{
    "type": "FeatureCollection",
    "features": [
    {
        "type": "Feature",
        "geometry":
        {
            "type": "Polygon",
            "coordinates": [
                [
                    [34.8341, -15.2765],
                    [34.835, -15.2762],

                    .......

                    [34.8327, -15.2769],
                    [34.8341, -15.2765]
                ]
            ]
        },
        "properties":
        {
            "Type": "Polygon",
            "WRA": 10,
            "Shape_Leng": 342.221353,
            "Shape_Area": 1658.734432,
            "Bassins": "South East Lakeshore"
        }
    },
    ..........
    ]
}
```
and we want to use the key `Bassins` to extract the variable.

API URL request

```url
http://baseURL/download_raw_data?apiKey=wxXvVw8RBRbLmnCv&dataset=ALL&temporalRes=monthly&variable=precip&startDate=2023-09&endDate=2023-10&geomExtract=geojson&geojsonSource=user&geojsonFile=malawi_watershed.geojson&geojsonField=Bassins&outFormat=JSON-Format
```

GET and POST request parameters

```python
params = {
	'apiKey': 'wxXvVw8RBRbLmnCv',
	'dataset': 'ALL',
	'temporalRes': 'monthly',
	'variable': 'precip',
	'startDate': '2023-09',
	'endDate': '2023-10',
	'geomExtract': 'geojson',
	'geojsonSource': 'user',
	'geojsonFile': 'malawi_watershed.geojson',
	'geojsonField': 'Bassins',
	'outFormat': 'JSON-Format'
}
```

> **NOTE**: if the geometry type is __Polygon__ or __MultiPolygon__, the data will be spatially averaged over the polygon/mutlipolygon.

#### <u>Extraction using a shapefile</u>

- **Source of shapefile**:

| Key | Values | Type |
| :------- | :------ | :------- |
| **shpSource** | `'user'`: the shapefile is taken from user-uploaded shapefiles <br> `'default'`: the shapefile is from the default shapefiles already come with DST | string |

> **NOTE**: in case of `shpSource=user`, you must first upload the shapefile into your profile from the menu **_My Account_** when you logged into your account from the website. The screenshot below shows an example of a list of user-uploaded shapefiles

<center>
<img src="<<<<urlPrefix>>>>/static/images/user_shapefile_table.png" width="70%"/>
</center>

> The shapefile must consist of the 4 files with file names extensions: `.shp`, `.shx`, `.dbf` and `.prj`. The shapefile's coordinate system must be EPSG:4326 (WGS84). The geographic features in the shapefile must be a polygons. The users must upload exactly 4 files into their profiles, for example

```
Rwanda_watershed_lev02.shp
Rwanda_watershed_lev02.shx
Rwanda_watershed_lev02.dbf
Rwanda_watershed_lev02.prj
```

> **NOTE**: in case of `shpSource=default`, check the website to see all available shapefiles. They are listed in the dropdown list `Select shapefile` when you select `Default Polygons from Map` as shown below

<center>
<img src="<<<<urlPrefix>>>>/static/images/default_shapefile.png" width="40%"/>
</center>

- **Shapefile name and field to use**:

| Key | Values | Type |
| :------- | :------ | :------- |
| **shpFile** | the shapefile's filename from user account or default shapefiles come with DST | string |
| **shpField** | the field name to use | string |

__Example__:

API URL request

```url
http://baseURL/download_raw_data?apiKey=wxXvVw8RBRbLmnCv&dataset=ALL&temporalRes=monthly&variable=precip&Date=2023-09&outFormat=netCDF-Format&geomExtract=polygons&shpSource=user&shpFile=malawi_watershed&shpField=Bassins&...
```

GET and POST request parameters

```python
params = {
	'apiKey': 'wxXvVw8RBRbLmnCv',
	'dataset': 'ALL',
	'temporalRes': 'monthly',
	'variable': 'precip',
	'Date': '2023-09',
	'outFormat': 'netCDF-Format',
	'geomExtract': 'polygons',
	'shpSource': 'user',
	'shpFile': 'malawi_watershed',
	'shpField': 'Bassins',
	...
}
```

- **Selecting the polygons over which the variable will be extracted**:

| Key | Values | Type |
| :------- | :------ | :------- |
| **Poly** | values of `shpField` corresponding to the selected polygons | string or list |
| **allPolygons** | select all polygons in `shpField` | bolean |

> **NOTE**: if `allPolygons=True` the key `Poly` is not used and can be removed. <br>
> If `allPolygons=False`, you can omit `allPolygons`, but the parameter `Poly` must be present and have at least one value.

__Examples__:

1\. Select one polygon

 API URL request

```url
http://baseURL/download_raw_data?apiKey=wxXvVw8RBRbLmnCv&dataset=ALL&temporalRes=monthly&variable=precip&Date=2023-09&outFormat=netCDF-Format&geomExtract=polygons&shpSource=user&shpFile=malawi_watershed&shpField=Bassins&Poly=South+East+Lakeshore
```

GET and POST request parameters

```python
params = {
	'dataset': 'ALL',
	'temporalRes': 'monthly',
	'variable': 'precip',
	'Date': '2023-09',
	'outFormat': 'netCDF-Format',
	'geomExtract': 'polygons',
	'shpSource': 'user',
	'shpFile': 'malawi_watershed',
	'shpField': 'Bassins',
	'Poly': 'South East Lakeshore'
}
```

2\. Select multiple polygons

API URL request

```url
http://baseURL/download_raw_data?apiKey=wxXvVw8RBRbLmnCv&dataset=ALL&temporalRes=monthly&variable=precip&Date=2023-09&outFormat=netCDF-Format&geomExtract=polygons&shpSource=user&shpFile=malawi_watershed&shpField=Bassins&Poly=South+East+Lakeshore&Poly=Shire&Poly=Ruo&Poly=L.+Chilwa
```

__Python code__

GET and POST request parameters

```python
import request

apiKey = 'wxXvVw8RBRbLmnCv'
baseUrl = 'http://168.253.224.242:9091/dst'
endpoint = 'download_raw_data'
headers = { 'Authorization': f'Apikey {apiKey}' }

params = {
	'dataset': 'ALL',
	'temporalRes': 'monthly',
	'variable': 'precip',
	'Date': '2023-09',
	'outFormat': 'netCDF-Format',
	'geomExtract': 'polygons',
	'shpSource': 'user',
	'shpFile': 'malawi_watershed',
	'shpField': 'Bassins',
	'Poly': ['South East Lakeshore', 'Shire', 'Ruo', 'L. Chilwa']
}

url = f'{baseUrl}/{endpoint}'
response = requests.get(url, params=params, headers=headers)
# response = requests.post(url, json=params, headers=headers)
```

__R code using the `httr` package__

GET request parameters

```r
library(httr)

apiKey <- 'wxXvVw8RBRbLmnCv'
baseUrl <- 'http://168.253.224.242:9091/dst'
endpoint <- 'download_raw_data'
headers <- add_headers(Authorization = paste('Apikey', apiKey))

params <- list(
	dataset = 'ALL',
	temporalRes = 'monthly',
	variable = 'precip',
	Date = '2023-09',
	outFormat = 'netCDF-Format',
	geomExtract = 'polygons',
	shpSource = 'user',
	shpFile = 'malawi_watershed',
	shpField = 'Bassins',
	Poly = 'South East Lakeshore',
	Poly = 'Shire',
	Poly = 'Ruo',
	Poly = 'L. Chilwa'
)

url <- paste0(baseUrl, '/', endpoint)
response <- GET(url, query = params, headers)
```

POST request parameters

```r
library(httr)

apiKey <- 'wxXvVw8RBRbLmnCv'
baseUrl <- 'http://168.253.224.242:9091/dst'
endpoint <- 'download_raw_data'
headers <- add_headers(Authorization = paste('Apikey', apiKey))

params <- list(
	dataset = 'ALL',
	temporalRes = 'monthly',
	variable = 'precip',
	Date = '2023-09',
	outFormat = 'netCDF-Format',
	geomExtract = 'polygons',
	shpSource = 'user',
	shpFile = 'malawi_watershed',
	shpField = 'Bassins',
	Poly = list('South East Lakeshore', 'Shire', 'Ruo', 'L. Chilwa')
)

url <- paste0(baseUrl, '/', endpoint)
response <- POST(url, body = params, encode = 'json', headers)
```

3\. Select all polygons

 API URL request

```url
http://baseURL/download_raw_data?apiKey=wxXvVw8RBRbLmnCv&dataset=ALL&temporalRes=monthly&variable=precip&Date=2023-09&outFormat=netCDF-Format&geomExtract=polygons&shpSource=user&shpFile=malawi_watershed&shpField=Bassins&allPolygons=true
```

GET and POST request parameters

```python
params = {
	'dataset': 'ALL',
	'temporalRes': 'monthly',
	'variable': 'precip',
	'Date': '2023-09',
	'outFormat': 'netCDF-Format',
	'geomExtract': 'polygons',
	'shpSource': 'user',
	'shpFile': 'malawi_watershed',
	'shpField': 'Bassins',
	'allPolygons': True
}
```

- **Spatially average data over polygons**:

The above requests return a gridded data over each polygon, if you want to get the time series over each polygon you need to spatially average the values of all grid points inside the polygon by adding the following parameter

| Key | Values | Type |
| :------- | :------ | :------- |
| **spatialAvg** | `True`: spatially average data over each polygon, returns a time series <br> `False`: get the gridded data over each polygon| boolean |

> **NOTE:** **spatialAvg** is optional and can be omitted if its value is `False`.

__Example__:

API URL request

```url
http://baseURL/download_raw_data?apiKey=wxXvVw8RBRbLmnCv&dataset=ALL&temporalRes=monthly&variable=precip&startDate=2023-09&endDate=2023-10&outFormat=CSV-CDT-Format&geomExtract=polygons&shpSource=user&shpFile=malawi_watershed&shpField=Bassins&Poly=South+East+Lakeshore&Poly=Shire&Poly=Ruo&Poly=L.+Chilwa&spatialAvg=true
```

GET and POST request parameters

```python
params = {
	'dataset': 'ALL',
	'temporalRes': 'monthly',
	'variable': 'precip',
	'startDate': '2023-09',
	'endDate': '2023-10',
	'outFormat': 'CSV-CDT-Format',
	'geomExtract': 'polygons',
	'shpSource': 'user',
	'shpFile': 'malawi_watershed',
	'shpField': 'Bassins',
	'Poly': ['South East Lakeshore', 'Shire', 'Ruo', 'L. Chilwa'],
	'spatialAvg': True
}
```

> **NOTE**: If multiple polygons are selected and the data is gridded (`spatialAvg=false`), the output file is zipped. Each zip file contains the gridded data over each polygon in a separate file.<br>
> In case of `spatialAvg=true`, the coordinates for each polygon are its centroid.


### Downloading climatology data: `download_climtology_data`

#### <u>Common request parameters</u>

All the parameters from the endpoint `download_raw_data` apply to this endpoint. See [Common request parameters](#common-request-parameters) from previous section.

For seasonal data, the season length is needed and must set by the following parameter

| Key | Value | Type |
| :------- | :------ | :------- |
| **seasLength** | Length of the season, must be `from 2 to 12` | integer |

#### <u>Geometry extraction support parameters</u>

All the parameters for extraction support from the endpoint `download_raw_data` apply to this endpoint.

- [Extraction over a list of points](#extraction-over-a-list-of-points)
- [Extraction over a rectangle](#extraction-over-a-rectangle)
- [Extraction using GeoJSON data](#extraction-using-geojson-data)
- [Extraction using a shapefile](#extraction-using-a-shapefile)

#### <u>Cilmatology date</u>

You can choose between computing the climatology for the whole year and a specific date of the year.

| Key | Values | Type |
| :------- | :------ | :------- |
| **fullYear** | `True`: compute the climatology for the entire year <br> `False`: compute the climatology for a specific period of a year | boolean |

If `fullYear=true`, you can omit this parameter.<br>
If `fullYear=false`, the date you want to compute the climatology must be provided, and set with the following parameter

| Key | Value | Type |
| :------- | :------ | :------- |
| **climDate** | Date on which the climatology will be computed | string |

> **Date format:** <br>
> __daily__: `MM-DD`, where `MM` is the month and `DD` the day, e.g., '06-30' for June 30th <br>
> __dekadal__: `MM-D`, where `MM` is the month and `D` the dekad. There are 3 dekads in a calendar month. The dekad must be 1, 2 or 3; dekad 1 (days from the 1st to 10th), dekad 2 (11th to 20th) and dekad 3 (21st to the end of the month), e.g., '03-3'  for the 3rd dekad of March<br>
> __monthly__: `MM`, where `MM`  is the month, e.g., '02' for February <br>
> __seasonal__: `MM`, the starting month of the season, `from 01 to 12` <br>
> __annual__: there is no `climDate` for annual and you can omit the parameters  `fullYear` and `climDate` <br>

__Example__:

1\. Computing climatology for full year

API URL request

```url
http://baseURL/download_climtology_data?apiKey=wxXvVw8RBRbLmnCv&dataset=ALL&temporalRes=monthly&variable=precip&geomExtract=points&pointsSource=user&pointsFile=malawi_loc.csv&climFunction=mean&startYear=1991&endYear=2020&minYear=30&outFormat=CSV-CDT-Format
```

GET and POST request parameters

```python
params = {
	'dataset': 'ALL',
	'temporalRes': 'monthly',
	'variable': 'precip',
	'geomExtract': 'points',
	'pointsSource': 'user',
	'pointsFile': 'malawi_loc.csv',
	'climFunction': 'mean',
	'startYear': 1991,
	'endYear': 2020,
	'minYear': 30,
	'outFormat': 'CSV-CDT-Format'
}
```

2\. Computing climatology for February

API URL request

```url
http://baseURL/download_climtology_data?apiKey=wxXvVw8RBRbLmnCv&dataset=ALL&temporalRes=monthly&variable=precip&geomExtract=points&pointsSource=user&pointsFile=malawi_loc.csv&climFunction=mean&startYear=1991&endYear=2020&minYear=30&outFormat=CSV-CDT-Format&fullYear=false&climDate=02
```

GET and POST request parameters

```python
params = {
	'dataset': 'ALL',
	'temporalRes': 'monthly',
	'variable': 'precip',
	'geomExtract': 'points',
	'pointsSource': 'user',
	'pointsFile': 'malawi_loc.csv',
	'climFunction': 'mean',
	'startYear': 1991,
	'endYear': 2020,
	'minYear': 30,
	'outFormat': 'CSV-CDT-Format',
	'fullYear': False,
	'climDate': '02'
}
```

#### <u>Setting base period</u>

| Key | Values | Type |
| :------- | :------ | :------- |
| **startYear** | Base period start year | integer |
| **endYear** | Base period end year | integer |
| **minYear** | Minimum number of years to compute the climatology. | integer |

> **NOTE**: the default value of `minYear` is 30 years, if you are using the default value you can omit `minYear` from your request. <br>
> If the available data is less than `minYear` a missing values will be returned. 

#### <u>Climatology function</u>

The function used to compute the climatology is set with the following parameter

| Key | Values | Type |
| :------- | :------ | :------- |
| **climFunction** | `'mean'`: average <br> `'median'`: median <br> `'min'`: minimum <br> `'max'`: maximum <br> `'stdev'`: standard deviation <br> `'percentile'`: percentage of data that fall at or below a specific value <br> `'cv'`: coefficient of variation <br> `'frequency'`: percentage of times a  value occurs within a dataset <br> `'mean-stdev'`: compute the average and the standard deviation at the same time | string |

If `climFunction=percentile`, the value to compute the percentile must be provided and set with the following parameter

| Key | Values | Type |
| :------- | :------ | :------- |
| **precentileValue** | the `nth` percentile, must be `between 0 and 100` inclusive <br> or a list of percentiles (e.g., `[5, 25, 50, 75, 95]`) | float or a list of float |

__Example__:

GET and POST request parameters

```python
params = {
	'dataset': 'ALL',
	'temporalRes': 'monthly',
	'variable': 'precip',
	'geomExtract': 'points',
	'pointsSource': 'user',
	'pointsFile': 'malawi_loc.csv',
	'startYear': 1991,
	'endYear': 2020,
	'minYear': 30,
	'outFormat': 'JSON-Format',
	'climFunction': 'percentile',
	'precentileValue': 95,
#	'precentileValue': [5, 25, 50, 75, 95]
}
```

If `climFunction=frequency`, two parameters must be provided, the operator and the threshold to use

| Key | Values | Type |
| :------- | :------ | :------- |
| **frequencyOper** | comparison (or relational) operator used to count the number of times the value occurs related to a given threshold. <br> Available options: `'>'`, `'>='`, `'<'` and `'<='` | string |
| **frequencyThres** | the threshold to use | float |

__Example__:

GET and POST request parameters

```python
params = {
	'dataset': 'ALL',
	'temporalRes': 'monthly',
	'variable': 'precip',
	'geomExtract': 'points',
	'pointsSource': 'user',
	'pointsFile': 'malawi_loc.csv',
	'startYear': 1991,
	'endYear': 2020,
	'minYear': 30,
	'outFormat': 'JSON-Format',
	'climFunction': 'frequency',
	'frequencyOper': '>=',
	'frequencyThres': 300
}
```

#### <u>Daily climatology</u>

You have an option to compute the climatology for a specific day using values around that day. The data used to compute the climatology for a given day can be increased by using a centered window. For example, to compute the climatology for January 1st with a window of 3 days, then the data used to compute the climatology start from December 28th to January 4th, i.e., `2 * daysWindow + 1` values are used to compute the climatology. 

| Key | Value | Type |
| :------- | :------ | :------- |
| **daysWindow** | centered days window | integer |

> **NOTE**: the parameter `daysWindow` can be omitted when the value is 0, i.e., no centered window is used, the climatology is calculated with the data of the target day.

__Example__:

API URL request

```url
http://baseURL/download_climtology_data?apiKey=wxXvVw8RBRbLmnCv&dataset=ALL&temporalRes=daily&variable=precip&climFunction=mean&startYear=1991&endYear=2020&daysWindow=5&geomExtract=points&pointsSource=user&pointsFile=malawi_loc.csv&outFormat=JSON-Format
```

GET and POST request parameters

```python
params = {
	'dataset': 'ALL',
	'temporalRes': 'daily',
	'variable': 'precip',
	'geomExtract': 'points',
	'pointsSource': 'user',
	'pointsFile': 'malawi_loc.csv',
	'climFunction': 'mean',
	'startYear': 1991,
	'endYear': 2020,
	'daysWindow': 5,
	'outFormat': 'JSON-Format'
}
```

#### <u>Output formart</u>


### Downloading analysis data: `download_analysis_data`


