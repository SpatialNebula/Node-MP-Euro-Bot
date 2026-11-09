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

module.exports.push({
    path: "/uniformrequests",
    method: "POST",
    /**
     * 
     * @param {fastify.FastifyRequest} request 
     * @param {fastify.FastifyReply} reply 
     */
    callback: async (request, reply, client) => {
        const body = request.body;
        
        for (let requirement of ["robloxName", "discordName", "subcategory", "rank", "uniforms"]) {
            if (!(requirement in body)) {reply.status(400); reply.send(); return};
        }

        const {robloxName, discordName, subcategory, rank, uniforms} = body
        
        const targetChannel = await client.channels.cache.get("1552012945590845520")
        const targetThread = await targetChannel.threads.cache.get("1558187782743261224")
        const actionRow = new discord.ActionRowBuilder()
            .addComponents(acceptBtn.data, completeBtn.data, rejectBtn.data);
        
        const textContainer = new discord.ContainerBuilder()
            .addTextDisplayComponents(new discord.TextDisplayBuilder().setContent(`### Uniform Funding Notification\nSomeone has requested uniform funding, <@&1556385054295326850`))
            .addSeparatorComponents(new discord.SeparatorBuilder().setDivider(true))
            .addTextDisplayComponents(new discord.TextDisplayBuilder().setContent(`**Username**\nRoblox: ${robloxName}\nDiscord: ${discordName}`))
            .addTextDisplayComponents(new discord.TextDisplayBuilder().setContent(`**Subcategory**\nGroup: ${subcategory}\nRank: ${rank}`))
            .addTextDisplayComponents(new discord.TextDisplayBuilder().setContent(`**Uniform(s)**\n${uniforms}`));

        const currentInteraction = await targetThread.send({components: [textContainer, actionRow], flags: [discord.MessageFlags.IsComponentsV2]})

        const uniformrequest = await uniReqs.create({
            robloxName, discordName, subcategory, rank, uniforms,
            accepted: false, sentLongReminder: false,
            lastInteractionTime: Date.now(),
            currentInteraction: currentInteraction.id
        })

        await uniformrequest.save()

        reply.send({statusCode: 200, message: "OK"})
    }
})