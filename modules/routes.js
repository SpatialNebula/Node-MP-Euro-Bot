const fastify = require("fastify")
const discord = require("discord.js")
const mongoose = require("mongoose")
const uniReqs = require("./mongodb/uniformrequests")

const acceptBtn = require("./buttons/acceptuniformrequest")
const completeBtn = require("./buttons/completeuniformrequest")
const rejectBtn = require("./buttons/rejectuniformrequest")

module.exports = []

module.exports.push({
    path: "/",
    method: "GET",
    /**
     * 
     * @param {fastify.FastifyRequest} request 
     * @param {fastify.FastifyReply} reply 
     */
    callback: async (request, reply) => {
        reply.send({statusCode: 200, message: "OK"})
    }
})