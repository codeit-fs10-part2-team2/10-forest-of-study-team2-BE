const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Forest of Study API',
      version: '1.0.0',
      description: 'Forest of Study Backend API Documentation',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: process.env.API_URL || `http://localhost:${process.env.PORT || 3000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Local development server',
      },
    ],
    components: {
      schemas: {
        Study: {
          type: 'object',
          properties: {
            study_id: {
              type: 'integer',
              description: 'Study unique identifier',
            },
            nickname: {
              type: 'string',
              description: 'Study nickname',
            },
            study_name: {
              type: 'string',
              description: 'Study name',
            },
            study_introduction: {
              type: 'string',
              description: 'Study introduction',
            },
            password: {
              type: 'string',
              description: 'Study password',
            },
            background: {
              type: 'integer',
              description: 'Background number (0-7)',
              minimum: 0,
              maximum: 7,
            },
            point_sum: {
              type: 'integer',
              description: 'Total points',
            },
            concentration_time: {
              type: 'string',
              format: 'time',
              description: 'Concentration time',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Point: {
          type: 'object',
          properties: {
            point_pk: {
              type: 'integer',
              description: 'Point unique identifier',
            },
            study_id: {
              type: 'integer',
              description: 'Study ID',
            },
            point_content: {
              type: 'string',
              description: 'Point content',
            },
            point: {
              type: 'integer',
              description: 'Point value',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Habit: {
          type: 'object',
          properties: {
            habit_pk: {
              type: 'integer',
              description: 'Habit unique identifier',
            },
            study_id: {
              type: 'integer',
              description: 'Study ID',
            },
            habit_name: {
              type: 'string',
              description: 'Habit name',
            },
            isRemoved: {
              type: 'boolean',
              description: 'Is habit removed',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        HabitFullfillment: {
          type: 'object',
          properties: {
            habit_fullfillment_pk: {
              type: 'integer',
              description: 'Habit fullfillment unique identifier',
            },
            habit_pk: {
              type: 'integer',
              description: 'Habit ID',
            },
            study_id: {
              type: 'integer',
              description: 'Study ID',
            },
            habit_fullfillment_year: {
              type: 'integer',
              description: 'Fullfillment year',
            },
            habit_fullfillment_week: {
              type: 'integer',
              description: 'Fullfillment week (0-53)',
            },
            habit_fullfillment_day: {
              type: 'integer',
              description: 'Fullfillment day (0-6)',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Emoji: {
          type: 'object',
          properties: {
            emoji_id: {
              type: 'integer',
              description: 'Emoji unique identifier',
            },
            study_id: {
              type: 'integer',
              description: 'Study ID',
            },
            emoji_name: {
              type: 'string',
              description: 'Emoji name/character',
            },
            emoji_hit: {
              type: 'integer',
              description: 'Emoji hit count',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
            message: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/app.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

