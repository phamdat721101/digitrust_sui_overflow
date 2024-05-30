# DigiTrust

DigiTrust is the decentralized asset management protocol

## Overview

```mermaid
sequenceDiagram
    Strategy->>DGT_Vault: Subscribe to relevant data sources
    activate DGT_Vault
    loop Every second for each data source
        DGT->>+DataSource: Request new data point
        DataSource->>DataSource: Call external API
        DataSource->>-DGT: New data point
        loop For each subscribing strategy
            DGT->>+Strategy: New data point
            Strategy->>-DGT: Trade orders
            DGT->>DGT_Vault: Submit trade orders as a single transaction block
        end
    end
    deactivate DGT_Vault
```

## Installation

1. Clone this repository.
2. Install dependencies with `npm install`.

## Build and Run the Bot

Build the project with `npm run build`

Run the script with `npm run start`