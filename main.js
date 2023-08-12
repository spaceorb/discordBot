// Please note that the codebase may exhibit some inconsistencies due to my evolving knowledge of JavaScript. While I have made efforts to refactor the older code, not every part has been updated yet.

const Discord = require("discord.js");
const QuickChart = require("quickchart-js");
const mongoose = require("mongoose");
const DraftBotRole = require("./models/DiscordRoleSchema");
const PlayerModel = require("./models/PlayerSchema");
const AllServers = require("./models/AllServersSchema");
const BotData = require("./models/BotDataSchema");
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
const { MessageEmbed } = require("discord.js");
const { Console } = require("console");
require("dotenv").config();
const chart = new QuickChart();
const guildData = {};
const botData = {};

client.on("ready", async () => {
  await mongoose
    .connect(process.env.MONGODB_SRV, {
      keepAlive: true,
    })
    .then(() => {
      console.log("Connected to the database!");
    })
    .catch((err) => {
      console.log(err);
    });

  const allGuildData = await AllServers.find();
  allGuildData.forEach((server) => {
    guildData[server.guildId] = server;
  });
  const allBotData = await BotData.find();

  allBotData.forEach((serverBotData) => {
    botData[serverBotData.guildId] = serverBotData;
  });
  console.log("botData", botData);
});

client.on("guildCreate", async (guild) => {
  const mainChatChannel = guild.channels.cache.find((channel) => {
    return (
      channel.type === "GUILD_TEXT" &&
      (channel.name.includes("general") || channel.name.includes("main"))
    );
  });

  // If no "main" or "general" chat channel found, use the first text channel
  const firstTextChannel = guild.channels.cache.find(
    (channel) => channel.type === "GUILD_TEXT"
  );
  const targetChannel = mainChatChannel || firstTextChannel;

  // Get the emojis from the guild
  const guildEmojis = guild.emojis.cache.map((emoji) => {
    return {
      id: emoji.id,
      name: emoji.name,
      url: emoji.url,
    };
  });

  // Create roles required on guild join
  await guild.roles.create({
    data: {
      name: "scorekeeper",
      color: "#6482d0",
      permissions: "DEFAULT",
    },
  });

  const newCategory = await guild.channels.create("»»—— DraftBot ——««", {
    type: "GUILD_CATEGORY",
  });
  const draftResultChannel = await guild.channels.create("draft-results", {
    type: "GUILD_TEXT",
    parent: newCategory,
  });
  const seasonWinnersChannel = await guild.channels.create("season-leaders", {
    type: "GUILD_TEXT",
    parent: newCategory,
  });

  const dateString = new Date(Date.now()).toLocaleString();

  // Prepare data for the new server document
  const newGuildData = {
    guildId: guild.id,
    guildName: guild.name,
    guildOwnerId: guild.ownerId,
    guildMemberCount: guild.memberCount,
    guildEmojis: guildEmojis,
    guildPrefix: "$",
    guildJoinedDate: String(dateString),
    guildMainChannel: targetChannel.id,
    guildWinnersChannel: seasonWinnersChannel.id,
    guildDraftResultChannel: draftResultChannel.id,
  };

  await AllServers.create(newGuildData);

  const newBotData = {
    guildId: guild.id,
    channelId: targetChannel.id,
    gameScoreChannel: draftResultChannel.id,
    seasonWinnersChannel: seasonWinnersChannel.id,
  };

  await BotData.create(newBotData);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

client.on("messageCreate", async (msg) => {
  var currentServerData = await BotData.findOne({ guildId: msg.guild.id });
  var currentServer = await AllServers.findOne({ guildId: msg.guild.id });
  var allServerUsers = await PlayerModel.find({ guildId: msg.guild.id });
  var banList = currentServerData.banList;

  if (!banList.includes(`<@${msg.author.id}>`)) {
    var {
      captains,
      team1,
      team2,
      playerAndTime,
      randomizedDraftList,
      randomizedDraftListCopy,
      alerted8People,
      lastChMsg,
      lastMsg,
      lastMsgCopy,
      listArr,
      randomizedArr,
      voted,
      votedCopy,
      lastChMsgCopy,
      lastRankMsg,
      lastRankMsgCopy,
      draftPool,
      inDraft,
      randomizedAlready,
      team1ScoreCopy,
      team2ScoreCopy,
      dqScore,
      regularScore,
      nextPlayerAndTime,
      nextPlayerAndTimeCopy,
      nextList,
      nextListCopy,
      nextPingedPlayers,
      nextPingedPlayersCopy,
      team1re,
      team2re,
      namesWithSpaces,
      namesWithSpacesCopy,
      msgIncludesCrown,
      newDraftPingedPlayers,
      winnerNames,
      loserNames,
      leaverNames,
      resetCount,
      randomizedCount,
      resetRandomized,
      draftCopy,
      draft2Copy,
      inDraftDraftCopy,
      team1DraftCopy,
      team2DraftCopy,
      captainsDraftCopy,
      startedPicks,
      startedPicksCopy,
      playerAndTimeCopy,
      team1Win,
      team2Win,
      team2Loss,
      dqWin,
      dqLoss,
      regularWin,
      regularLoss,
      peopleSymbol,
      dashSymbol,
      commandSymbol,
      banList,
      oldListArr1,
      oldListArr2,
    } = currentServerData;
    let captainA;
    let captainB;
    const checkCaptains = () => {
      captainA = captains[0] ? captains[0] : "";
      captainB = captains[1] ? captains[1] : "";
    };

    const updatePeopleSymbol = () => {
      peopleSymbol = startedPicks ? ":lock:" : ":unlock:";
    };
    updatePeopleSymbol();
    const updateLeaderboard = async () => {
      for (let i = 0; i < allServerUsers.length; i++) {
        PlayerModel.findOneAndUpdate(
          { userId: allServerUsers[i].userId, guildId: msg.guild.id },
          {
            $set: {
              value: ` **${allServerUsers[i].lp}** (${allServerUsers[i].totalWin}-${allServerUsers[i].totalLoss})`,
            },
          },
          { new: true }
        ).exec((err, data) => {
          if (err) throw err;
          playerExist = true;
        });
      }
    };
    const clearScores = () => {
      winnerNames = [];
      loserNames = [];
      leaverNames = [];
      team1Score = [];
      team2Score = [];
      regularScore = [];
      team1ScoreCopy = [];
      team2ScoreCopy = [];
      dqScore = [];
      team1Win = 0;
      team1Loss = 0;
      team2Win = 0;
      team2Loss = 0;
      dqWin = 0;
      dqLoss = 0;
    };
    function turnEmojiToId(emoji) {
      let result = [];
      emoji = emoji.split("");
      emoji.map((a) => (parseInt(a) + 1 ? result.push(a) : null));

      return result.join("");
    }
    function turnMmrToTitle(mmr, rank, listLength) {
      rank = rank + 1;
      if ((rank / listLength) * 100 <= 5) {
        return platinum;
      } else if ((rank / listLength) * 100 <= 10) {
        return goldA;
      } else if ((rank / listLength) * 100 <= 20) {
        return goldB;
      } else if ((rank / listLength) * 100 <= 40) {
        return silver;
      } else if ((rank / listLength) * 100 <= 70) {
        return bronze;
      } else {
        return iron;
      }
    }
    function turnMmrToTitle2(rank, listLength) {
      if ((rank / listLength) * 100 <= 5) {
        return platinum;
      } else if ((rank / listLength) * 100 <= 10) {
        return goldA;
      } else if ((rank / listLength) * 100 <= 20) {
        return goldB;
      } else if ((rank / listLength) * 100 <= 40) {
        return silver;
      } else if ((rank / listLength) * 100 <= 70) {
        return bronze;
      } else {
        return iron;
      }
    }
    function getTimeAgo(time, now) {
      const timeDiff = now - time;
      const oneMinute = 60 * 1000; // milliseconds
      const oneHour = 60 * oneMinute;
      const oneDay = 24 * oneHour;
      const oneWeek = 7 * oneDay;

      if (timeDiff < oneMinute) {
        return "Just now";
      } else if (timeDiff < oneHour) {
        const minutes = Math.floor(timeDiff / oneMinute);
        return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
      } else if (timeDiff < oneDay) {
        const hours = Math.floor(timeDiff / oneHour);
        return `${hours} hour${hours > 1 ? "s" : ""} ago`;
      } else if (timeDiff < oneWeek) {
        const days = Math.floor(timeDiff / oneDay);
        return `${days} day${days > 1 ? "s" : ""} ago`;
      } else {
        return "Over 7 days ago";
      }
    }
    const checkListForMedals = (name) => {
      const currentPlayer = allServerUsers.find(
        (user) => user.userId === name && user.guildId === msg.guild.id
      );
      let newList = allServerUsers.sort((a, b) => b.lp - a.lp);
      newList = newList.filter((a) => a.playedSeason);
      let indexOfPlayer;
      console.log("newList", newList);

      for (let i = 0; i < newList.length; i++) {
        newList[i].userId === name && indexOfPlayer === undefined
          ? (indexOfPlayer = i)
          : null;
      }

      console.log("INDEX OF PLAYER", indexOfPlayer);
      console.log("NEW LIST LENGTH", newList.length);

      return `${
        indexOfPlayer === undefined
          ? bronze
          : turnMmrToTitle2(indexOfPlayer, newList.length)
      } ${name}`;
    };
    async function addDataToChart(msg, dataY, dataX, userId, clientA) {
      msg.guild.members.fetch(userId).then(async (member) => {
        let discordName;

        if (member.nickname !== null) {
          discordName = member.nickname;
        } else if (member.nickname === null) {
          discordName = member.user.username;
        }

        discordName = discordName.toUpperCase();
        discordName = removeSpaceChar(discordName);

        chart.setConfig({
          type: "line",
          data: {
            datasets: [
              {
                label: "Users",
                data: dataY,
                fill: true,
                barPercentage: 0.9,
                categoryPercentage: 0.8,
                type: "line",
                borderColor: "rgba(208, 56, 45, 1)", // Changed the borderColor to the desired rgba color

                backgroundColor: "rgba(100, 130, 208, 0.5)",
                borderWidth: 2,
                hidden: false,
                yAxisID: "Y1",
              },
            ],
            labels: dataX,
          },
          options: {
            title: {
              display: true,
              position: "top",
              fontSize: 12,
              fontFamily: "sans-serif",
              fontColor: "#666666",
              fontStyle: "bold",
              padding: 10,
              lineHeight: 1.2,
              text: `${discordName}'s Current History`,
            },
            layout: {
              padding: {
                left: 0,
                right: 50,
                top: 0,
                bottom: 0,
              },
            },
            legend: {
              display: false,
              position: "left",
              align: "center",
              fullWidth: true,
              reverse: false,
              labels: {
                fontSize: 12,
                fontFamily: "sans-serif",
                fontColor: "#000000",
                fontStyle: "normal",
                padding: 10,
              },
            },
            scales: {
              xAxes: [
                {
                  id: "X1",
                  display: true,
                  position: "bottom",
                  type: "category",
                  stacked: false,
                  distribution: "linear",
                  gridLines: {
                    display: false,
                    color: "rgba(0, 0, 0, 0.1)",
                    borderDash: [0, 0],
                    lineWidth: 1,
                    drawBorder: true,
                    drawOnChartArea: true,
                    drawTicks: true,
                    tickMarkLength: 10,
                    zeroLineWidth: 1,
                    zeroLineColor: "rgba(208, 56, 45, 1)",
                    zeroLineBorderDash: [0, 0],
                  },
                  angleLines: {
                    display: true,
                    color: "rgba(0, 0, 0, 0.1)",
                    borderDash: [0, 0],
                    lineWidth: 1,
                  },
                  pointLabels: {
                    display: true,
                    fontColor: "#666",
                    fontSize: 10,
                    fontStyle: "normal",
                  },
                  ticks: {
                    display: true,
                    fontSize: 12,
                    fontFamily: "sans-serif",
                    fontColor: "#666666",
                    fontStyle: "normal",
                    padding: 0,
                    stepSize: null,
                    minRotation: 0,
                    maxRotation: 50,
                    mirror: false,
                    reverse: false,
                  },
                  scaleLabel: {
                    display: true,
                    labelString: "Drafts Played",
                    lineHeight: 1.2,
                    fontColor: "#666666",
                    fontFamily: "sans-serif",
                    fontSize: 12,
                    fontStyle: "normal",
                    padding: 4,
                  },
                },
              ],
              yAxes: [
                {
                  id: "Y1",
                  display: true,
                  position: "left",
                  type: "linear",
                  stacked: false,
                  ticks: {
                    display: true,
                    fontSize: 12,
                    fontFamily: "sans-serif",
                    fontColor: "#666666",
                    fontStyle: "normal",
                    padding: 0,
                    stepSize: null,
                    minRotation: 0,
                    maxRotation: 50,
                    mirror: false,
                    reverse: false,
                    max: 1600,
                  },
                  scaleLabel: {
                    display: true,
                    labelString: "MMR",
                    lineHeight: 1.2,
                    fontColor: "#666666",
                    fontFamily: "sans-serif",
                    fontSize: 12,
                    fontStyle: "normal",
                    padding: 4,
                  },
                },
              ],
            },
            plugins: {
              datalabels: {
                display: true,
                align: "center",
                anchor: "center",
                backgroundColor: "rgba(100, 130, 208, 0.7)",
                borderColor: "rgba(208, 56, 45, 1)",
                borderRadius: 0,
                borderWidth: 0,
                padding: 3,
                color: "rgba(275, 275, 275, 1)",
                font: {
                  family: "sans-serif",
                  size: 11,
                  style: "bold",
                },
              },
              tickFormat: "",
            },
            cutoutPercentage: 50,
            rotation: -1.5707963267948966,
            circumference: 6.283185307179586,
            startAngle: -1.5707963267948966,
          },
        });

        let newList = allServerUsers.sort((a, b) => b.lp - a.lp);
        let finalList = [];
        let playedSeason = false;
        newList.map((a) => (a.playedSeason ? finalList.push(a) : null));
        finalList.map((a) =>
          a.userId == `<@${userId}>`
            ? (playedSeason = true)
            : console.log("Person did not play this season")
        );
        console.log("finallist", finalList);

        if (playedSeason) {
          for (let i = 0; i < finalList.length; i++) {
            if (finalList[i].userId == `<@${userId}>`) {
              for (let p = 0; p < allServerUsers.length; p++) {
                if (allServerUsers[p].userId == `<@${userId}>`) {
                  const url = await chart.getShortUrl();
                  let emojiUrl = `https://cdn.discordapp.com/emojis/${turnEmojiToId(
                    allServerUsers[p].previousSeason.split(" ")[0]
                  )}.png`;

                  let chartEmbed = new Discord.MessageEmbed()
                    .setColor("#6482d0")
                    .setAuthor(`${discordName}`, member.displayAvatarURL())
                    .setDescription(
                      `${rfTrophy} **Rank:** **#${i + 1} of ${
                        finalList.length
                      }**\nCurrent MMR: **${
                        allServerUsers[p].lp
                      } ${turnMmrToTitle(
                        allServerUsers[p].lp,
                        i,
                        finalList.length
                      )} **\n\nBest Season: **${
                        allServerUsers[p].bestSeason
                      }**\nLast Season: **${allServerUsers[p].previousSeason}**`
                    )
                    .addFields(
                      {
                        name: "Total Drafts:",
                        value: `Win: **${
                          allServerUsers[p].totalWin
                        }** \nLoss: **${
                          allServerUsers[p].totalLoss
                        }** \nWin Rate: **${Math.round(
                          (allServerUsers[p].totalWin /
                            (allServerUsers[p].totalWin +
                              allServerUsers[p].totalLoss)) *
                            100
                        )}%**\n`,
                        inline: true,
                      },
                      {
                        name: "Total Games:",
                        value: `Win: **${allServerUsers[p].win}** \nLoss: **${
                          allServerUsers[p].loss
                        }** \nWin Rate: **${Math.round(
                          (allServerUsers[p].win /
                            (allServerUsers[p].win + allServerUsers[p].loss)) *
                            100
                        )}%**\n`,
                        inline: true,
                      },
                      {
                        name: "Season Titles:",
                        value:
                          allServerUsers[p].medals.length > 0 &&
                          allServerUsers[p].medals[0].includes(":")
                            ? `${allServerUsers[p].medals.join(" ")}`
                            : ":reminder_ribbon:",
                        inline: true,
                      },
                      {
                        name: "Recent Games:",
                        value: `${allServerUsers[p].recentGames
                          .map(
                            (game) =>
                              game.slice(0, 1) +
                              " `" +
                              game.slice(1, game.length - 1).join(" ") +
                              " " +
                              getTimeAgo(
                                game[game.length - 1],
                                new Date().getTime()
                              ) +
                              `\`` +
                              "\n"
                          )
                          .reverse()
                          .slice(0, 5)
                          .join(" ")}`,
                        inline: true,
                      }
                    )

                    .setImage(`${url}`)
                    .setThumbnail(
                      `${
                        allServerUsers[p].medals.length === 0 ||
                        allServerUsers[p].previousSeason === "**None**"
                          ? member.displayAvatarURL()
                          : emojiUrl
                      }`
                    );

                  msg.channel.send({ embeds: [chartEmbed] });
                }
              }
            }
          }
        } else if (!playedSeason) {
          for (let p = 0; p < allServerUsers.length; p++) {
            if (allServerUsers[p].userId == `<@${userId}>`) {
              const url = await chart.getShortUrl();
              let emojiUrl = `https://cdn.discordapp.com/emojis/${turnEmojiToId(
                allServerUsers[p].previousSeason.split(" ")[0]
              )}.png`;

              let chartEmbed = new Discord.MessageEmbed()
                .setColor("#3de5f6")
                .setAuthor(`${discordName}`, member.displayAvatarURL())
                .setDescription(
                  `${rfTrophy} **Rank:** *Season not yet played.* \nCurrent MMR: **1000**\n\nBest Season: **${allServerUsers[p].bestSeason}**\nLast Season: **${allServerUsers[p].previousSeason}**`
                )
                .addFields(
                  {
                    name: "Total Drafts:",
                    value: `Win: **${allServerUsers[p].totalWin}** \nLoss: **${allServerUsers[p].totalLoss}**`,
                    inline: true,
                  },
                  {
                    name: "Total Games:",
                    value: `Win: **${allServerUsers[p].win}** \nLoss: **${allServerUsers[p].loss}**`,
                    inline: true,
                  },
                  {
                    name: "Season Titles:",
                    value:
                      allServerUsers[p].medals.length > 0 &&
                      allServerUsers[p].medals[0].includes(":")
                        ? `${allServerUsers[p].medals.join(" ")}`
                        : ":reminder_ribbon:",
                    inline: true,
                  },
                  {
                    name: "Recent Games:",
                    value: "`None`",
                    inline: true,
                  }
                )
                .setImage(`${url}`)
                .setThumbnail(emojiUrl);

              msg.channel.send({ embeds: [chartEmbed] });
            }
          }
        }
      });
    }
    function updateTime() {
      let playerTimed = false;
      let yourping = msg.createdTimestamp;
      let d = new Date(yourping);

      for (let i = 0; i < playerAndTime.length; i++) {
        if (playerAndTime[i].name == `<@${msg.author.id}>`) {
          playerTimed = true;
        }
      }
      if (!playerTimed) {
        playerAndTime.push({
          name: `<@${msg.author.id}>`,
          time: [d.getHours(), d.getMinutes()],
          enteredBy: "self",
          remainingTime: [],
        });
      }
    }

    currentServerData.inDraft = inDraft;
    currentServerData.startedPicks = startedPicks;
    currentServerData.startedPicksCopy = startedPicksCopy;
    currentServerData.captains = captains;
    currentServerData.team1 = team1;
    currentServerData.team2 = team2;
    currentServerData.playerAndTime = playerAndTime;
    currentServerData.randomizedDraftList = randomizedDraftList;
    currentServerData.randomizedDraftListCopy = randomizedDraftListCopy;
    currentServerData.alerted8People = alerted8People;
    currentServerData.lastChMsg = lastChMsg;
    currentServerData.lastMsg = lastMsg;
    currentServerData.lastMsgCopy = lastMsgCopy;
    currentServerData.listArr = listArr;
    currentServerData.randomizedArr = randomizedArr;
    currentServerData.voted = voted;
    currentServerData.votedCopy = votedCopy;
    currentServerData.lastChMsgCopy = lastChMsgCopy;
    currentServerData.lastRankMsg = lastRankMsg;
    currentServerData.lastRankMsgCopy = lastRankMsgCopy;
    currentServerData.draftPool = draftPool;
    currentServerData.inDraft = inDraft;
    currentServerData.randomizedAlready = randomizedAlready;
    currentServerData.team1ScoreCopy = team1ScoreCopy;
    currentServerData.team2ScoreCopy = team2ScoreCopy;
    currentServerData.dqScore = dqScore;
    currentServerData.regularScore = regularScore;
    currentServerData.nextList = nextList;
    currentServerData.nextListCopy = nextListCopy;
    currentServerData.nextPlayerAndTime = nextPlayerAndTime;
    currentServerData.nextPlayerAndTimeCopy = nextPlayerAndTimeCopy;
    currentServerData.nextPingedPlayers = nextPingedPlayers;
    currentServerData.nextPingedPlayersCopy = nextPingedPlayersCopy;
    currentServerData.team1re = team1re;
    currentServerData.team2re = team2re;
    currentServerData.namesWithSpaces = namesWithSpaces;
    currentServerData.namesWithSpacesCopy = namesWithSpacesCopy;
    currentServerData.msgIncludesCrown = msgIncludesCrown;
    currentServerData.newDraftPingedPlayers = newDraftPingedPlayers;
    currentServerData.winnerNames = winnerNames;
    currentServerData.loserNames = loserNames;
    currentServerData.leaverNames = leaverNames;
    currentServerData.resetCount = resetCount;
    currentServerData.randomizedCount = randomizedCount;
    currentServerData.resetRandomized = resetRandomized;
    currentServerData.draftCopy = draftCopy;
    currentServerData.draft2Copy = draft2Copy;
    currentServerData.inDraftDraftCopy = inDraftDraftCopy;
    currentServerData.team1DraftCopy = team1DraftCopy;
    currentServerData.team2DraftCopy = team2DraftCopy;
    currentServerData.captainsDraftCopy = captainsDraftCopy;
    currentServerData.playerAndTimeCopy = playerAndTimeCopy;
    currentServerData.team1Win = team1Win;
    currentServerData.team2Win = team2Win;
    currentServerData.team2Loss = team2Loss;
    currentServerData.dqWin = dqWin;
    currentServerData.dqLoss = dqLoss;
    currentServerData.regularWin = regularWin;
    currentServerData.regularLoss = regularLoss;
    currentServerData.peopleSymbol = peopleSymbol;
    currentServerData.dashSymbol = dashSymbol;
    currentServerData.commandSymbol = commandSymbol;
    currentServerData.oldListArr1 = oldListArr1;
    currentServerData.oldListArr2 = oldListArr2;
    currentServerData.banList = banList;

    currentServerData
      .save()
      .then(() => {
        console.log("Data updated successfully in MongoDB");
      })
      .catch((err) => {
        console.error("Error updating data in MongoDB:", err);
      });
  }
});
client.login(process.env.TOKEN);
