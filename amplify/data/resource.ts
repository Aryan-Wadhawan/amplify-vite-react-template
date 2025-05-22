import { defineData, a, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
  User: a.model({
    name: a.string().required(),
    email: a.string().required(),
    role: a.string().required(), // "child" | "parent" | "therapist"

    parentId: a.id(),        // Optional by design (just don't mark required)
    therapistId: a.id(),     // Optional

    parent: a.belongsTo('User', 'parentId'),
    therapist: a.belongsTo('User', 'therapistId'),

    childrenAsParent: a.hasMany('User', 'parentId'),
    childrenAsTherapist: a.hasMany('User', 'therapistId'),
  }),

  Assessment: a.model({
    childId: a.id().required(),
    child: a.belongsTo('User', 'childId'),

    score: a.integer(),           // Optional
    responses: a.string(),        // Optional
    timestamp: a.datetime(),      // Optional
  }),

  Task: a.model({
    childId: a.id().required(),
    therapistId: a.id().required(),
    child: a.belongsTo('User', 'childId'),
    therapist: a.belongsTo('User', 'therapistId'),

    type: a.string().required(),         // text/audio
    instructions: a.string().required(),
    status: a.string().required(),       // assigned/completed
    createdAt: a.datetime(),             // Optional
  }),

  TaskResponse: a.model({
    taskId: a.id().required(),
    childId: a.id().required(),
    task: a.belongsTo('Task', 'taskId'),
    child: a.belongsTo('User', 'childId'),

    responseText: a.string(),     // Optional
    audioURL: a.string(),         // Optional
    timestamp: a.datetime(),      // Optional
  }),

  ChatLog: a.model({
    childId: a.id().required(),
    child: a.belongsTo('User', 'childId'),

    messages: a.string(),         // Optional
    timestamp: a.datetime(),      // Optional
  }),

  Report: a.model({
    childId: a.id().required(),
    child: a.belongsTo('User', 'childId'),

    reportType: a.string().required(),
    reportURL: a.string().required(),
    generatedAt: a.datetime(),    // Optional
  }),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
