{
  "nodes": [
    {
      "id": "webhook-multi",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.1,
      "position": [-1400, 300],
      "parameters": {
        "httpMethod": "POST",
        "path": "multi-messages-demo",
        "options": {}
      },
      "webhookId": "multi-messages-demo-id"
    },
    {
      "id": "set-base",
      "name": "Set Campos Base",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [-1180, 300],
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "name": "Numero_Telefono",
              "value": "={{ $json.body?.data?.key?.remoteJidAlt?.split('@')[0] || $json.from || $json.numero || '' }}",
              "type": "string"
            },
            {
              "name": "Mensaje",
              "value": "={{ $json.body?.data?.message?.conversation || $json.mensaje || '' }}",
              "type": "string"
            }
          ]
        }
      }
    },
    {
      "id": "redis-push",
      "name": "Redis PUSH",
      "type": "n8n-nodes-base.redis",
      "typeVersion": 1,
      "position": [-960, 300],
      "parameters": {
        "operation": "push",
        "list": "={{ $json.Numero_Telefono }}",
        "messageData": "={{ JSON.stringify({ message: $json.Mensaje, date_time: $now.toISO() }) }}",
        "tail": true
      },
      "credentials": {
        "redis": {
          "id": "REEMPLAZA_ESTO",
          "name": "Redis account"
        }
      }
    },
    {
      "id": "wait-7",
      "name": "Wait 7s",
      "type": "n8n-nodes-base.wait",
      "typeVersion": 1.1,
      "position": [-740, 300],
      "parameters": {
        "amount": 7
      },
      "webhookId": "wait-multi-messages"
    },
    {
      "id": "redis-get",
      "name": "Redis GET",
      "type": "n8n-nodes-base.redis",
      "typeVersion": 1,
      "position": [-520, 300],
      "parameters": {
        "operation": "get",
        "key": "={{ $json.Numero_Telefono }}",
        "propertyName": "Mensaje",
        "options": {}
      },
      "credentials": {
        "redis": {
          "id": "REEMPLAZA_ESTO",
          "name": "Redis account"
        }
      }
    },
    {
      "id": "set-concat",
      "name": "Concatenar Mensajes",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [-300, 300],
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "name": "mensaje_concatenado",
              "value": "={{ Array.isArray($json.Mensaje) ? $json.Mensaje.map(m => { try { return JSON.parse(m).message } catch(e) { return m } }).join('\\n') : '' }}",
              "type": "string"
            },
            {
              "name": "Numero_Telefono",
              "value": "={{ $json.Numero_Telefono }}",
              "type": "string"
            }
          ]
        }
      }
    },
    {
      "id": "if-empty",
      "name": "IF Mensaje Vacío",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [-80, 300],
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.mensaje_concatenado }}",
              "operation": "isEmpty"
            }
          ]
        }
      }
    },
    {
      "id": "redis-del",
      "name": "Redis DEL",
      "type": "n8n-nodes-base.redis",
      "typeVersion": 1,
      "position": [140, 380],
      "parameters": {
        "operation": "delete",
        "key": "={{ $json.Numero_Telefono }}"
      },
      "credentials": {
        "redis": {
          "id": "REEMPLAZA_ESTO",
          "name": "Redis account"
        }
      }
    },
    {
      "id": "no-op",
      "name": "NoOp",
      "type": "n8n-nodes-base.noOp",
      "typeVersion": 1,
      "position": [140, 220],
      "parameters": {}
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Set Campos Base",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Set Campos Base": {
      "main": [
        [
          {
            "node": "Redis PUSH",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Redis PUSH": {
      "main": [
        [
          {
            "node": "Wait 7s",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Wait 7s": {
      "main": [
        [
          {
            "node": "Redis GET",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Redis GET": {
      "main": [
        [
          {
            "node": "Concatenar Mensajes",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Concatenar Mensajes": {
      "main": [
        [
          {
            "node": "IF Mensaje Vacío",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "IF Mensaje Vacío": {
      "main": [
        [
          {
            "node": "NoOp",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Redis DEL",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
