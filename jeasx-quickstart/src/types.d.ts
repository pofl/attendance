/* This file is an example. Delete it at will. */

import { FastifyReply } from "fastify/types/reply";
import { FastifyRequest } from "fastify/types/request";
import serverless from "jeasx/serverless";

type FastifyServer = typeof serverless;

type RouteProps = {
  request?: FastifyRequest;
  reply?: FastifyReply;
};

type ThisContext = RouteProps & {
  // add additional attributes
};
