


# Prescription Notification Service API

URL: https://notificationservice-h8caaaeka7ceh0cx.canadacentral-01.azurewebsites.net

---

## Introduction

The **Prescription Notification Service API** is designed to manage prescription notifications and handle queue processing efficiently. This service fetches incomplete prescriptions and sends daily reports to pharmacies.

## Features

- **Trigger Prescription Notifications:** Initiate the process to fetch and notify incomplete prescriptions.
- **Queue Processing with RabbitMQ:** Efficiently handle message queuing and processing tasks.


## API Documentation

Swagger UI is integrated for interactive API exploration and testing. Access it at https://notificationservice-h8caaaeka7ceh0cx.canadacentral-01.azurewebsites.net.

### Endpoints

#### 1. Trigger Prescription Notifications

- **URL:** `/api/trigger-prescription-notifications`
- **Method:** `POST`
- **Description:** Initiates the process to fetch incomplete prescriptions and send notification emails to pharmacies.
- **Responses:**
  - **200 OK**
    - **Description:** Notification task published successfully.
    - **Example:**
      ```json
      {
        "message": "Notification task published successfully",
        "timestamp": "2025-01-28T11:49:06Z"
      }
      ```
  - **500 Internal Server Error**
    - **Description:** Failed to publish notification task.
    - **Example:**
      ```json
      {
        "error": "Failed to publish notification task",
        "message": "Internal server error message"
      }
      ```

#### 2. Health Check

- **URL:** `/health`
- **Method:** `GET`
- **Description:** Checks the health status of the service.
- **Responses:**
  - **200 OK**
    - **Description:** Service is healthy.
    - **Example:**
      ```json
      {
        "status": "healthy",
        "timestamp": "2025-01-28T11:49:06Z"
      }
      ```

## Services Overview

### GatewayService

Handles fetching incomplete prescriptions from the gateway. It interacts with external systems to retrieve the necessary prescription data.

### EmailService

Manages the creation and sending of notification emails to pharmacies. It ensures that daily reports are sent out with the latest incomplete prescription information.

### RabbitMQService

Manages the connection and communication with RabbitMQ. It handles publishing and consuming notification tasks, ensuring reliable queue processing.
