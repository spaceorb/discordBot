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

let stone = "<:stick:1017804743290126376>";
let iron = "<:ironZ:1101593630625509487>";
let bronze = "<:bronzeZ:1018085243720302653>";
let silver = "<:silver:1018085299240316958>";
let goldB = "<:goldB:1018085340927504454>";
let goldA = "<:goldA:1018085413107269685>";
let platinum = "<:plat:1018085729517195265>";
let playersToEditRoles = [];
let rfTrophy = "<:rf_trophy:1017789940593078372>";

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
    function updatePlayerCount() {
      checkCaptains();
      listArr = [
        peopleSymbol,
        `**${
          captains.length + inDraft.length + team1.length + team2.length
        }**\n`,
        "\n",
        `**Team 1**: ${captainA ? `:crown: \n ${captainA}\n` : "\n "} ${`${
          team1 ? team1.join("\n ") + `${team1.length > 0 ? "\n\n" : "\n"}` : ""
        }`}`,
        `**Team 2**: ${captainB ? ":crown: \n " + captainB + "\n" : "\n"}`,
        `${
          team2 ? team2.join("\n ") + `${team2.length > 0 ? "\n\n" : "\n"}` : ""
        }`,
        `**Draft List**:\n ${inDraft.join(`${"\n"} ${dashSymbol}`)}`,
      ];
    }
    function removePerson(person) {
      if (typeof person === "object") {
        var checkIfCaptain = person.some((r) => captains.indexOf(r) >= 0);
        var checkIfInDraft = person.some((r) => inDraft.indexOf(r) >= 0);
        var checkIfInTeam1 = person.some((r) => team1.indexOf(r) >= 0);
        var checkIfInTeam2 = person.some((r) => team2.indexOf(r) >= 0);
      }

      if (checkIfInDraft) {
        if (
          inDraft.some((element) => element.includes(`<@${msg.author.id}>`))
        ) {
          inDraft.splice(inDraft.indexOf(person), 1);
          listArr = [
            peopleSymbol,
            `**${
              captains.length + inDraft.length + team1.length + team2.length
            }**`,
            "\n",
            dashSymbol,

            "\n",
            "\n",
            "**Team 1**:",

            `${team1.join("\n ")}`,
            "\n",
            "\n",
            "**Team 2**:",

            team2.join("\n"),
          ];
        }
      }

      if (checkIfInTeam1) {
        if (team1.some((element) => element.includes(person))) {
          team1.splice(team1.indexOf(person), 1);
          listArr = [
            peopleSymbol,
            `**${
              captains.length + inDraft.length + team1.length + team2.length
            }**`,
            "\n",
            dashSymbol,

            "\n",
            "\n",
            "**Team 1**:",

            `${team1.join("\n ")}`,
            "\n",
            "\n",
            "**Team 2**:",

            team2.join("\n"),
          ];
        }
      }

      if (checkIfInTeam2) {
        if (team2.some((element) => element.includes(person))) {
          team2.splice(team2.indexOf(person), 1);
          listArr = [
            peopleSymbol,
            `**${
              captains.length + inDraft.length + team1.length + team2.length
            }**`,
            "\n",
            dashSymbol,

            "\n",
            "\n",
            "**Team 1**:",

            `${team1.join("\n ")}`,
            "\n",
            "\n",
            "**Team 2**:",

            team2.join("\n"),
          ];
        }
      }

      if (checkIfCaptain) {
        if (captains[0].includes(person) || captains[1].includes(person)) {
          if (captains[0].includes(person)) {
            if (team1.length > 0) {
              captains.splice(0, 1, team1[0]);
              team1.splice(0, 1);
            } else {
              if (captains.length === 2) {
                captains.splice(0, 1);
                team1 = team2;
                team2 = [];
              } else {
                captains.splice(0, 1);
              }
            }
          } else if (captains[1].includes(person)) {
            if (team2.length > 0) {
              captains.splice(1, 1, team2[0]);
              team2.splice(0, 1);
            } else {
              captains.splice(1, 1);
            }
          }
        }
      }

      if (typeof person === "string") {
        console.log("hi person is string");
        if (inDraft.some((element) => element.includes(person))) {
          const index = inDraft.findIndex((element) =>
            element.includes(person)
          );
          inDraft.splice(index, 1);
          listArr = [
            peopleSymbol,
            `**${
              captains.length + inDraft.length + team1.length + team2.length
            }**`,
            "\n",
            dashSymbol,

            "\n",
            "\n",
            "**Team 1**:",

            `${team1.join("\n ")}`,
            "\n",
            "\n",
            "**Team 2**:",

            team2.join("\n"),
          ];
        }

        if (team1.some((element) => element.includes(person))) {
          const index = team1.findIndex((element) => element.includes(person));
          team1.splice(index, 1);
          listArr = [
            peopleSymbol,
            `**${
              captains.length + inDraft.length + team1.length + team2.length
            }**`,
            "\n",
            dashSymbol,

            "\n",
            "\n",
            "**Team 1**:",

            `${team1.join("\n ")}`,
            "\n",
            "\n",
            "**Team 2**:",

            team2.join("\n"),
          ];
        }

        if (team2.some((element) => element.includes(person))) {
          const index = team2.findIndex((element) => element.includes(person));
          team2.splice(index, 1);
          listArr = [
            peopleSymbol,
            `**${
              captains.length + inDraft.length + team1.length + team2.length
            }**`,
            "\n",
            dashSymbol,

            "\n",
            "\n",
            "**Team 1**:",

            `${team1.join("\n ")}`,
            "\n",
            "\n",
            "**Team 2**:",

            team2.join("\n"),
          ];
        }

        if (captains.some((element) => element.includes(person))) {
          const index = captains.findIndex((element) =>
            element.includes(person)
          );
          if (captains[0].includes(person)) {
            if (team1.length > 0) {
              captains.splice(0, 1, team1[0]);
              team1.splice(0, 1);
            } else {
              if (captains.length === 2) {
                captains.splice(0, 1);
                team1 = team2;
                team2 = [];
              } else {
                captains.splice(0, 1);
              }
            }
          } else if (captains[1].includes(person)) {
            if (team2.length > 0) {
              captains.splice(1, 1, team2[0]);
              team2.splice(0, 1);
            } else {
              captains.splice(1, 1);
            }
          }
        }
      }

      randomizedDraftList;
    }
    function updatedList() {
      let updatedListEmbed = new Discord.MessageEmbed()
        .setColor("#6482d0")
        .setFields([
          {
            name: `Team 1: ${captainA && "👑"}`,
            value: `${captainA && captainA + "     \n"}${team1.join("\n")}${
              !captainA && team1.length == 0
                ? "`    Empty    `"
                : captainA && team1.length >= 0
                ? "\n"
                : "\n"
            }`,
            inline: true,
          },
          {
            name: `Team 2: ${captainB && "👑"}  `,
            value: `${captainB && captainB + "     \n"}${team2.join("\n")}${
              !captainB && team2.length == 0
                ? "`    Empty    `"
                : captainB && team2.length >= 0
                ? "\n"
                : "\n"
            }`,
            inline: true,
          },
          {
            name: `\nDraft List: \`${inDraft.length}\``,
            value: `${
              inDraft.length == 0 ? "`    Empty    `" : inDraft.join("\n")
            }`,
          },
        ]);

      msg.channel.send({ embeds: [updatedListEmbed] });
    }
    async function removeOldMsg(oldMsg, newMsg) {
      console.log("newMsg", newMsg);
      console.log("lastMsg", lastMsg);

      oldMsg.channel.messages
        .fetch(lastMsg[0])
        .then(async (message) => {
          await oldMsg.channel.edit({ embeds: [newMsg] }).then((newMessage) => {
            if (message) {
              message.delete();
            } else {
              lastMsg = newMessage;
            }
          });
          // if (message) {
          //   message.delete();
          // } else {
          //   console.log("error");
          // }
        })
        .catch((lastMsg = []));
    }
    const removeSpaceChar = (name) => {
      return name.replace(/[^\w]/gi, "");
    };
    const swapNames = (x, y) => {
      const arraysToSearch = [inDraft, team1, team2, captains];
      let xArray, yArray;

      // Find the arrays containing x and y
      for (const array of arraysToSearch) {
        if (array.some((element) => element.includes(x))) xArray = array;
        if (array.some((element) => element.includes(y))) yArray = array;
      }

      if (xArray && yArray) {
        const xIndex = xArray.findIndex((element) => element.includes(x));
        const yIndex = yArray.findIndex((element) => element.includes(y));

        const temp = xArray[xIndex];
        xArray[xIndex] = yArray[yIndex];
        yArray[yIndex] = temp;
      }
    };

    await PlayerModel.find().then(async (allUsers) => {
      if (allUsers.length > 0) {
        allServerUsers = allUsers.filter((player) => {
          return player.guildId === msg.guild.id;
        });
      } else {
        allServerUsers.push({ guildId: "temp" });
      }
    });
    await AllServers.find().then((allServers) => {
      currentServer = allServers.filter(
        (server) => server.guildId === msg.guild.id
      );
    });

    if (currentServer !== undefined) {
      seasonWinnersChannel = currentServer[0].guildWinnersChannel;
      gameScoreChannel = currentServer[0].guildDraftResultChannel;
    }

    msg.content = msg.content.toLowerCase();
    let contents = msg.content.split(" ");
    let command = contents[0];
    if (msg.author.id === discordBotId && !msg.content.includes(peopleSymbol)) {
      if (lastChMsg !== msg.id) {
        lastChMsg.push(msg.id);
      } else {
        lastChMsgCopy = msg.id;
        console.log(lastChMsgCopy);
      }
    }

    if (msg.author.id === discordBotId && !msg.content.includes(peopleSymbol)) {
      if (lastRankMsg !== msg.id) {
        lastRankMsg = msg.id;
        console.log(`Message ID ${msg.id}`);
      } else {
        lastRankMsgCopy = msg.id;
        console.log(lastRankMsgCopy);
      }
    }
    function getRandomNum(x) {
      return Math.floor(Math.random() * x) + 1;
    }

    process.on("unhandledRejection", (error) => {
      console.error("Unhandled promise rejection:", error);
    });

    if (inDraft.length + captains.length + team1.length + team2.length > 2) {
      resetCount = 0;
    }

    if (
      msg.content === `${commandSymbol}list` ||
      msg.content === `${commandSymbol}ping`
    ) {
      updatePeopleSymbol();
      updatePlayerCount();
      if (randomizedAlready === 1) {
        removeOldMsg(msg, randomizedArr.join(" "));
      } else {
        removeOldMsg(msg, updatedList());
      }
    }

    if (msg.content === `${commandSymbol}nextlist`) {
      msg.channel.send(`The next draft list includes: ${nextList.join(" · ")}`);
    }
    if (msg.content === `${commandSymbol}reset`) {
      playerAndTime;
      oldDraftEnded = false;

      alerted8PeopleCopy = alerted8People;
      alerted8People = false;
      playerAndTimeCopy = playerAndTime;
      playerAndTime = nextPlayerAndTime;
      nextPlayerAndTimeCopy = nextPlayerAndTime;
      nextPlayerAndTime = [];
      draftCopy = listArr;
      draft2Copy = randomizedArr;
      inDraftDraftCopy = [...inDraft];
      team1DraftCopy = [...team1];
      team2DraftCopy = [...team2];
      captainsDraftCopy = [...captains];
      namesWithSpacesCopy = namesWithSpaces;
      resetCount = 1;
      let resultPingedPlayers = [];
      if (newDraftPingedPlayers.length > 0 || nextPingedPlayers.length > 0) {
        newDraftPingedPlayers.map((a) =>
          !resultPingedPlayers.includes(a) ? resultPingedPlayers.push(a) : null
        );
        nextPingedPlayers.map((a) =>
          !resultPingedPlayers.includes(a) ? resultPingedPlayers.push(a) : null
        );
      }

      inDraft = nextList.map((name) => checkListForMedals(name));

      nextListCopy = nextList;
      nextPingedPlayersCopy = nextPingedPlayers;
      nextList = [];
      nextPingedPlayers = [];
      newDraftPingedPlayers = [];
      team1 = [];
      team2 = [];
      draftPool = [];
      votedCopy = voted;
      voted = [];
      captains = [];
      count = 0;
      startedPicksCopy = startedPicks;
      startedPicks = false;

      // playerAndTime2Copy = playerAndTime2;
      // playerAndTime2 = [];
      // playerAndTime3 = [];

      if (randomizedAlready === 1) {
        resetRandomized = true;
      }
      randomizedAlready = 0;
      resetCopy = listArr.join(" ");

      listArr = [
        `»»—— **New Draft** ——««\n\n`,
        peopleSymbol,
        `**${
          captains.length + inDraft.length + team1.length + team2.length
        }**\n`,
        "\n",
        `**Team 1**: ${captainA ? `:crown: \n ${captainA}\n` : "\n "} ${`${
          team1 ? team1.join("\n ") + `${team1.length > 0 ? "\n\n" : "\n"}` : ""
        }`}`,
        `**Team 2**: ${captainB ? ":crown: \n " + captainB + "\n" : "\n"}`,
        `${
          team2 ? team2.join("\n ") + `${team2.length > 0 ? "\n\n" : "\n"}` : ""
        }`,
        `**Draft List**:\n ${inDraft.join(`${"\n"} ${dashSymbol}`)}`,
      ];
      checkCaptains();
      msg.channel.send(`»»—— **New Draft** ——««\n\n`);
      removeOldMsg(msg, updatedList());
      resetPeople = [];
      randomizedCount = 0;
      namesWithSpaces = [];
      randomizedDraftListCopy = randomizedDraftList;
      randomizedDraftList = [];
    }
    if (msg.content === `${commandSymbol}recover`) {
      if (resetCount === 1) {
        alerted8People = alerted8PeopleCopy;
        alerted8PeopleCopy = [];
        voted = votedCopy;
        startedPicks = startedPicksCopy;
        listArr = draftCopy;
        nextList = nextListCopy;
        nextPingedPlayers = nextPingedPlayersCopy;
        nextPlayerAndTime = nextPlayerAndTimeCopy;
        nextPlayerAndTimeCopy = [];
        randomizedArr = draft2Copy;
        namesWithSpaces = namesWithSpacesCopy;
        playerAndTime = playerAndTimeCopy;
        playerAndTimeCopy = [];

        if (resetRandomized) {
          randomizedDraftList = randomizedDraftListCopy;
          randomizedAlready = 1;
          randomizedCount = 1;
          resetRandomized = false;
          randomizedDraftListCopy = [];
        }
        console.log("A. team1: " + team1 + "team2: " + team2);
        inDraft = [...inDraftDraftCopy];
        team1 = [...team1DraftCopy];
        team2 = [...team2DraftCopy];
        captains = [...captainsDraftCopy];

        console.log("B. team1: " + team1 + "team2: " + team2);

        updatePlayerCount();
        removeOldMsg(msg, updatedList());

        startedPicksCopy = false;
        playerAndTimeCopy = [];
        votedCopy = [];
        inDraftDraftCopy = [];
        team1DraftCopy = [];
        team2DraftCopy = [];
        captainsDraftCopy = [];
        resetCount = 0;
      }
    }

    if (
      command === `${commandSymbol}in` ||
      command === `${commandSymbol}1n` ||
      command === `${commandSymbol}ln`
    ) {
      console.log("captains", captains);
      console.log(
        "captains",
        captains.some((element) => element.includes(`<@${msg.author.id}>`))
      );

      if (contents.length === 1) {
        if (
          inDraft.some((element) => element.includes(`<@${msg.author.id}>`)) ===
            false &&
          captains.some((element) =>
            element.includes(`<@${msg.author.id}>`)
          ) === false &&
          team1.some((element) => element.includes(`<@${msg.author.id}>`)) ===
            false &&
          team2.some((element) => element.includes(`<@${msg.author.id}>`)) ===
            false
        ) {
          if (!startedPicks) {
            inDraft.push(checkListForMedals(`<@${msg.author.id}>`));
            updatePlayerCount();

            if (
              inDraft.length + captains.length + team1.length + team2.length >=
                8 &&
              !alerted8People
            ) {
              msg.channel.send(
                `\`There's at least 8 players ready for a draft now.\`\n${[
                  ...inDraft,
                  ...captains,
                  ...team1,
                  ...team2,
                ]
                  .map((x) => x.split(" ")[1])
                  .join(" ▪ ")}`
              );

              alerted8People = true;
            }
            updateTime();

            // if (randomizedAlready === 1) {
            //   updatePlayerCount();
            //   removeOldMsg(msg, randomizedArr.join(" "));
            // } else {
            removeOldMsg(msg, updatedList());
          } else {
            msg.reply("**Draft is locked** :lock:");
          }
        } else if (
          inDraft.some((element) => element.includes(`<@${msg.author.id}>`)) ||
          captains.some((element) => element.includes(`<@${msg.author.id}>`)) ||
          team1.some((element) => element.includes(`<@${msg.author.id}>`)) ||
          team2.some((element) => element.includes(`<@${msg.author.id}>`))
        ) {
          msg.reply(`You're already in the draft.`);
        }
      } else if (contents.length > 1) {
        let temp = [];
        for (let i = 1; i < contents.length; i++) {
          if (
            !inDraft.some((element) => element.includes(contents[i])) &&
            !captains.some((element) => element.includes(contents[i])) &&
            !team1.some((element) => element.includes(contents[i])) &&
            !team2.some((element) => element.includes(contents[i]))
          ) {
            if (!startedPicks) {
              if (
                contents[i][0] === "<" &&
                contents[i][contents[i].length - 1] === ">" &&
                contents[i].length >= 17
              ) {
                inDraft.push(checkListForMedals(contents[i]));
                temp.push(checkListForMedals(contents[i]));
              }
            } else {
              msg.reply(`${contents[i]} sorry, draft is locked :lock:`);
            }
          } else if (
            inDraft.some((element) => element.includes(contents[i])) ||
            captains.some((element) => element.includes(contents[i])) ||
            team1.some((element) => element.includes(contents[i])) ||
            team2.some((element) => element.includes(contents[i]))
          ) {
            msg.reply(`${contents[i]} is already in the draft.`);
          }
        }

        if (
          inDraft.length + captains.length + team1.length + team2.length >= 8 &&
          !alerted8People
        ) {
          msg.channel.send(
            `\`There's at least 8 players ready for a draft now.\`\n${[
              ...inDraft,
              ...captains,
              ...team1,
              ...team2,
            ]
              .map((x) => x.split(" ")[1])
              .join(" ▪ ")}`
          );

          alerted8People = true;
        }

        updatePlayerCount();
        let timeStamp = msg.createdTimestamp;
        let e = new Date(timeStamp);

        for (let j = 0; j < contents.length; j++) {
          let playerTimed = false;

          for (let i = 0; i < playerAndTime.length; i++) {
            if (playerAndTime[i].name == contents[j]) {
              playerTimed = true;
            }
          }

          if (!playerTimed) {
            for (let i = 1; i < contents.length; i++) {
              if (
                contents[i][0] === "<" &&
                contents[i][contents[i].length - 1] === ">" &&
                contents[i].length >= 17 &&
                !playerAndTime.find((x) => x.name == contents[i])
              ) {
                playerAndTime.push({
                  name: contents[i],
                  time: [e.getHours(), e.getMinutes()],
                  enteredBy: msg.author.id,
                  remainingTime: [],
                });
              }
            }
          }
        }
        removeOldMsg(msg, updatedList());
      }
    }

    if (command === `${commandSymbol}next`) {
      if (contents.length === 1) {
        if (
          contents.length === 1 &&
          !nextList.includes(`<@${msg.author.id}>`)
        ) {
          nextPingedPlayers.push(`<@${msg.author.id}>`);
          console.log("pingedplayer id: " + nextPingedPlayers);

          nextList.push(`<@${msg.author.id}>`);
          let playerTimed = false;
          let yourping = msg.createdTimestamp;
          let d = new Date(yourping);

          for (let i = 0; i < nextPlayerAndTime.length; i++) {
            if (nextPlayerAndTime[i].name == `<@${msg.author.id}>`) {
              playerTimed = true;
            }
          }
          if (!playerTimed) {
            nextPlayerAndTime.push({
              name: `<@${msg.author.id}>`,
              time: [d.getHours(), d.getMinutes()],
              enteredBy: "self",
              remainingTime: [],
            });
          }

          msg.channel.send(
            `**${`<@${msg.author.id}>`}** has been added to the next draft list.`
          );
        } else if (nextList.includes(`<@${msg.author.id}>`)) {
          msg.channel.send(`You're already in the next draft.`);
        }
      }
    }

    if (
      msg.content === `${commandSymbol}randomize` ||
      msg.content === `${commandSymbol}rando`
    ) {
      if (randomizedCount === 0) {
        if (captains.length === 0) {
          if (inDraft.length % 2 === 0) {
            if (randomizedAlready === 1) {
              for (let i = 0; i < randomizedDraftList.length; i++) {
                if (!inDraft.includes(randomizedDraftList[i])) {
                  inDraft.push(randomizedDraftList[i]);
                }
              }
              // inDraft = [...randomizedDraftList];
              // resetRandomTeamList();
              team1 = [];
              team2 = [];
              randomizedDraftList = [];
              for (let i = 0; i < inDraft.length; i++) {
                let num = getRandomNum(20);
                if (num % 2 === 1) {
                  let temp = inDraft[i];
                  inDraft.splice(inDraft.indexOf(inDraft[i]), 1);
                  inDraft.unshift(temp);
                } else {
                  let temp = inDraft[i];
                  inDraft.splice(inDraft.indexOf(inDraft[i]), 1);
                  inDraft.push(temp);
                }
              }
            }

            let draftLength = inDraft.length;

            if (randomizedAlready === 0) {
              for (let i = 0; i < draftLength; i++) {
                let num = getRandomNum(20);
                if (num % 2 === 1) {
                  let temp = inDraft[i];
                  inDraft.splice(inDraft.indexOf(inDraft[i]), 1);
                  inDraft.unshift(temp);
                } else {
                  let temp = inDraft[i];
                  inDraft.splice(inDraft.indexOf(inDraft[i]), 1);
                  inDraft.push(temp);
                }
              }
            }

            if (captains.length > 0) {
              msg.channel.send("You can't randomize when there are captains!");
            } else if (inDraft.length === 0 && captains.length === 0) {
              msg.channel.send("There is no one to randomize.");
            } else if (
              (inDraft.length + captains.length) % 2 === 1 &&
              captains.length === 0
            ) {
              msg.channel.send("There is an odd amount of players.");
            } else if (draftLength % 2 === 0 && captains.length === 0) {
              team1 = [];
              team2 = [];
              for (let i = 0; i < draftLength; i++) {
                let num = getRandomNum(20);
                if (num % 2 === 1 && team1.length < draftLength / 2) {
                  team1.push(`${inDraft[0]}`);
                } else if (num % 2 === 0 && team2.length < draftLength / 2) {
                  team2.push(`${inDraft[0]}`);
                } else if (num % 2 === 1 && team1.length === draftLength / 2) {
                  team2.push(`${inDraft[0]}`);
                } else if (num % 2 === 0 && team2.length === draftLength / 2) {
                  team1.push(`${inDraft[0]}`);
                }

                let randomNum = Math.floor(Math.random() * 20) + 1;
                if (randomNum % 2 === 0) {
                  randomizedDraftList.unshift(inDraft[0]);
                } else {
                  randomizedDraftList.push(inDraft[0]);
                }
                inDraft.splice(0, 1);
              }
              updatePlayerCount();
              removeOldMsg(msg, updatedList());
              randomizedCopy = listArr.join(" ");
              randomizedAlready = 1;
            }
            randomizedCount++;
          } else {
            msg.channel.send("There is an odd amount of players.");
          }
        } else {
          msg.channel.send("You can't randomize when there are captains!");
        }
      } else {
        msg.channel.send("Teams were already randomized!");
      }
    }

    if (
      command === `${commandSymbol}captain` ||
      command === `${commandSymbol}captains`
    ) {
      if (randomizedAlready === 0) {
        if (contents.length === 1) {
          if (
            captains.some((element) => element.includes(`<@${msg.author.id}>`))
          ) {
            msg.reply("You are already captain.");
            personIn = true;
          } else if (
            captains.length < 2 &&
            inDraft.some((element) => element.includes(`<@${msg.author.id}>`))
          ) {
            const index = inDraft.findIndex((element) =>
              element.includes(`<@${msg.author.id}>`)
            );
            inDraft.splice(index, 1);

            if (captains.includes("")) {
              captains.splice(captains.indexOf(""), 1, `<@${msg.author.id}>`);
            } else {
              captains.push(checkListForMedals(`<@${msg.author.id}>`));
            }
            updateTime();
            checkCaptains();
            updatePlayerCount();
            removeOldMsg(msg, updatedList());
            randomizedAlready = 0;
            randomizedCount = 0;
          } else if (captains.length < 2) {
            if (
              team1.some((element) => element.includes(`<@${msg.author.id}>`))
            ) {
              msg.reply(`You are already in team 1.`);
            } else if (
              team2.some((element) => element.includes(`<@${msg.author.id}>`))
            ) {
              msg.reply(`You are already in team 2.`);
            } else if (
              contents.length === 1 &&
              !inDraft.some((element) =>
                element.includes(`<@${msg.author.id}>`)
              ) &&
              !captains.some((element) =>
                element.includes(`<@${msg.author.id}>`)
              ) &&
              !team1.some((element) =>
                element.includes(`<@${msg.author.id}>`)
              ) &&
              !team2.some((element) => element.includes(`<@${msg.author.id}>`))
            ) {
              if (!startedPicks) {
                captains.push(checkListForMedals(`<@${msg.author.id}>`));
                updateTime();
                checkCaptains();
                updatePlayerCount();
                removeOldMsg(msg, updatedList());
                randomizedAlready = 0;
                randomizedCount = 0;
              } else {
                msg.reply("**Draft is locked** :lock:");
              }
            }
          } else if (captains.length === 2) {
            msg.channel.send("There can't be 3 captains.");
          }

          if (
            inDraft.length + captains.length + team1.length + team2.length >=
              8 &&
            !alerted8People
          ) {
            msg.channel.send(
              `\`There's at least 8 players ready for a draft now.\`\n${[
                ...inDraft,
                ...captains,
                ...team1,
                ...team2,
              ]
                .map((x) => x.split(" ")[1])
                .join(" ▪ ")}`
            );
            msg.channel.send(listArr.join(" "));
            alerted8People = true;
          }
        }
        if (contents.length === 2) {
          if (contents[1] === `<@${msg.author.id}>`) {
            if (
              captains.some((element) =>
                element.includes(`<@${msg.author.id}>`)
              )
            ) {
              msg.reply("You are already captain.");
              personIn = true;
            } else if (
              captains.length < 2 &&
              inDraft.some((element) => element.includes(`<@${msg.author.id}>`))
            ) {
              const index = inDraft.findIndex((element) =>
                element.includes(`<@${msg.author.id}>`)
              );
              inDraft.splice(index, 1);
              if (captains.includes("")) {
                captains.splice(captains.indexOf(""), 1, `<@${msg.author.id}>`);
              } else {
                captains.push(checkListForMedals(`<@${msg.author.id}>`));
              }
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
              checkCaptains();
              updatePlayerCount();
              removeOldMsg(msg, updatedList());
              randomizedAlready = 0;
              randomizedCount = 0;
            } else if (captains.length < 2) {
              if (!startedPicks) {
                updateTime();
                captains.push(checkListForMedals(`<@${msg.author.id}>`));
                checkCaptains();
                updatePlayerCount();
                removeOldMsg(msg, updatedList());
                randomizedAlready = 0;
                randomizedCount = 0;
              } else {
                msg.reply("**Draft is locked** :lock:");
              }
            } else if (captains.length === 2) {
              msg.channel.send("There can't be 3 captains.");
            }

            if (
              inDraft.length + captains.length + team1.length + team2.length >=
                8 &&
              !alerted8People
            ) {
              msg.channel.send(`Players set for draft.`);
              // alerted8People = true;
            }
          } else if (
            contents[1][0] === "<" &&
            contents[1][contents[1].length - 1] === ">"
          ) {
            msg.reply(
              "Players can only captain themselves.\nOr, you may $vote for a captain and type $rc."
            );
          }
        }
      }
    }

    if (command === `${commandSymbol}uncaptain`) {
      const userId = msg.author.id;
      if (team1.length > 0 || team2.length > 0) {
        msg.reply(
          "You can't uncaptain when teams are forming. $redraft or $out. "
        );
      } else {
        if (
          captains.some((element) => element.includes(`<@${msg.author.id}>`))
        ) {
          console.log("Found captain");
          captains = captains.filter(
            (element) => !element.includes(`<@${msg.author.id}>`)
          );
          inDraft.push(checkListForMedals(`<@${msg.author.id}>`));
          checkCaptains();

          updatePlayerCount();
          removeOldMsg(msg, updatedList());
        } else {
          msg.reply("You were never captain.");
        }
      }
    }

    if (
      command === `${commandSymbol}out` ||
      command === `${commandSymbol}outt` ||
      command === `${commandSymbol}0ut`
    ) {
      if (!startedPicks) {
        //------- If content is yourself

        if (contents.length === 1) {
          if (
            inDraft.some((element) =>
              element.includes(`<@${msg.author.id}>`)
            ) ||
            captains.some((element) =>
              element.includes(`<@${msg.author.id}>`)
            ) ||
            team1.some((element) => element.includes(`<@${msg.author.id}>`)) ||
            team2.some((element) => element.includes(`<@${msg.author.id}>`))
          ) {
            removePerson(`<@${msg.author.id}>`);
            updatePlayerCount();
            for (let i = 0; i < playerAndTime.length; i++) {
              let player = playerAndTime[i];
              if (player.name == `<@${msg.author.id}>`) {
                playerAndTime.splice(i, 1);
              }
            }
            if (randomizedAlready === 1) {
              removeOldMsg(msg, randomizedArr.join(" "));
              randomizedDraftList.splice(
                randomizedDraftList.indexOf(`<@${msg.author.id}>`),
                1
              );
            } else {
              removeOldMsg(msg, updatedList());
            }
            if (
              inDraft.length + captains.length + team1.length + team2.length <
              8
            ) {
              alerted8People = false;
            }
            // randomizedAlready = 0;
          } else {
            msg.reply(`You were never in the draft. <@${msg.author.id}>`);
          }
        }
        //------- If contents are over 1
        if (contents.length > 1) {
          for (let i = 1; i < contents.length; i++) {
            if (
              inDraft.some((element) => element.includes(contents[i])) ||
              captains.some((element) => element.includes(contents[i])) ||
              team1.some((element) => element.includes(contents[i])) ||
              team2.some((element) => element.includes(contents[i]))
            ) {
              if (randomizedAlready === 1) {
                removePerson(contents[i]);
                const index = randomizedDraftList.findIndex((element) =>
                  element.includes(contents[i])
                );
                randomizedDraftList.splice(index, 1);
              } else {
                removePerson(contents[i]);
              }
            }
            for (let j = 0; j < playerAndTime.length; j++) {
              let player = playerAndTime[j];
              if (player.name == contents[i]) {
                playerAndTime.splice(j, 1);
              }
            }
          }
          updatePlayerCount();
          if (randomizedAlready === 1) {
            removeOldMsg(msg, randomizedArr.join(" "));
          } else {
            removeOldMsg(msg, updatedList());
          }

          if (
            inDraft.length + captains.length + team1.length + team2.length <=
            7
          ) {
            alerted8People = false;
          }
        }
      } else {
        msg.reply(`**Draft is locked** :lock:`);
      }
    }

    if (msg.content === `${commandSymbol}flip`) {
      function headsOrTails() {
        return Math.floor(Math.random() * 100) + 1;
      }

      if (headsOrTails() % 2 === 1) {
        msg.channel.send("***Heads*** :skeleton:");
      } else {
        msg.channel.send("***Tails*** :dragon:");
      }
    }

    if (command === `${commandSymbol}pick`) {
      let stop = 0;

      if (
        contents.length === 1 &&
        captains.some((element) => element.includes(`<@${msg.author.id}>`))
      ) {
        msg.channel.send("You didn't pick anyone.");
        stop = 1;
      } else if (
        !captains.some((element) => element.includes(`<@${msg.author.id}>`))
      ) {
        console.log("captains", captains);
        msg.channel.send("You're not captain.");
        stop = 1;
      }

      if (captains[0].includes(`<@${msg.author.id}>`) && stop === 0) {
        if (
          contents.length === 2 &&
          !inDraft.some((element) => element.includes(contents[1]))
        ) {
          if (contents[1] === `<@${msg.author.id}>`) {
            msg.reply(`You can't pick yourself.`);
          } else if (
            team1.some((element) => element.includes(contents[1])) ||
            captains[0].includes(contents[1])
          ) {
            msg.reply(`${contents[1]} is on team 1 already.`);
          } else if (
            team2.some((element) => element.includes(contents[1])) ||
            captains[1].includes(contents[1])
          ) {
            msg.reply(`${contents[1]} is on team 2 already.`);
          } else {
            console.log("team1", team1);
            console.log("team2", team2);
            console.log("inDraft", inDraft);
            console.log("captains", captains);

            msg.reply(`${contents[1]} is not in the draft.`);
          }
        } else {
          for (let i = 1; i < contents.length; i++) {
            if (
              inDraft.some((element) => element.includes(contents[i])) &&
              contents[i].length > 15
            ) {
              team1.push(checkListForMedals(contents[i]));
              inDraft.splice(
                inDraft.findIndex((element) => element.includes(contents[i])),
                1
              );
            }
          }

          updatePlayerCount();
          removeOldMsg(msg, updatedList());
        }
      } else if (
        captains[1].includes(`<@${msg.author.id}>`) &&
        contents.length <= 4 &&
        stop === 0
      ) {
        if (
          contents.length === 2 &&
          !inDraft.some((element) => element.includes(contents[1]))
        ) {
          if (contents[1] === `<@${msg.author.id}>`) {
            msg.reply(`You can't pick yourself.`);
          } else if (
            team1.some((element) => element.includes(contents[1])) ||
            captains[0].includes(contents[1])
          ) {
            msg.reply(`${contents[1]} is on team 1 already.`);
          } else if (
            team2.some((element) => element.includes(contents[1])) ||
            captains[1].includes(contents[1])
          ) {
            msg.reply(`${contents[1]} is on team 2 already.`);
          } else {
            console.log("team1", team1);
            console.log("team2", team2);
            console.log("inDraft", inDraft);
            console.log("captains", captains);

            msg.reply(`${contents[1]} is not in the draft.`);
          }
        } else {
          for (let i = 1; i < contents.length; i++) {
            if (
              inDraft.some((element) => element.includes(contents[i])) &&
              contents[i].length > 15
            ) {
              team2.push(checkListForMedals(contents[i]));
              inDraft.splice(
                inDraft.findIndex((element) => element.includes(contents[i])),
                1
              );
            }
          }

          updatePlayerCount();
          removeOldMsg(msg, updatedList());
        }
      }
    }

    if (
      command === `${commandSymbol}lock` &&
      (captains.includes(`<@${msg.author.id}>`) ||
        msg.member.roles.cache.some((role) => role.name === "scorekeeper"))
    ) {
      startedPicks = true;
      peopleSymbol = ":lock:";
      msg.channel.send(
        `**Draft is now locked** :lock: by, <@${msg.author.id}>\n**Please wait until a scorekeeper is ready to $redraft for other players.\nYou may type $next to auto join the next draft list.**\n`
      );
    } else if (command === `${commandSymbol}lock`) {
      msg.reply("Only captains or scorekeeper's may $lock a draft.");
    }
    if (
      command === `${commandSymbol}unlock` &&
      (captains.includes(`<@${msg.author.id}>`) ||
        msg.member.roles.cache.some((role) => role.name === "scorekeeper"))
    ) {
      startedPicks = false;
      peopleSymbol = ":unlock:";
      msg.channel.send(
        `**Draft has been unlocked** :unlock: by, <@${msg.author.id}>`
      );
    } else if (command === `${commandSymbol}unlock`) {
      msg.reply("Only captains or scorekeeper's may $unlock a draft.");
    }
    if (
      msg.content === `${commandSymbol}redraft` ||
      msg.content === `${commandSymbol}resetteams` ||
      msg.content === `${commandSymbol}resetteam`
    ) {
      if (
        !startedPicks ||
        msg.member.roles.cache.some((role) => role.name === "scorekeeper")
      ) {
        if (captains.length > 0 && !inDraft.includes(captains[0])) {
          inDraft.push(captains[0]);
        }
        if (captains.length === 2 && !inDraft.includes(captains[1])) {
          inDraft.push(captains[1]);
        }
        if (team1.length > 0) {
          for (let i = 0; i < team1.length; i++) {
            if (!inDraft.includes(team1[i])) {
              inDraft.push(team1[i]);
            }
          }
        }
        if (team2.length > 0) {
          for (let i = 0; i < team2.length; i++) {
            if (!inDraft.includes(team2[i])) {
              inDraft.push(team2[i]);
            }
          }
        }

        timeOutStart = "";
        timeOutEnd = "";
        startedPicks = false;
        voted = [];
        draftPool = [];
        team1 = [];
        team2 = [];
        captains = [];
        captainsCopy = [];
        team1Copy = [];
        team2Copy = [];
        inDraftCopy = [];
        team1re = [];
        team2re = [];
        randomizedCount = 0;
        updatePlayerCount();
        removeOldMsg(msg, updatedList());
        randomizedDraftList = [];
        randomizedAlready = 0;
      } else if (startedPicks) {
        msg.reply("**Draft is locked** :lock:");
      }
    }

    if (command === `${commandSymbol}swap`) {
      if (contents[1] && contents[2]) {
        if (
          (inDraft.some((element) => element.includes(contents[1])) ||
            team1.some((element) => element.includes(contents[1])) ||
            team2.some((element) => element.includes(contents[1])) ||
            captains.some((element) => element.includes(contents[1]))) &&
          (inDraft.some((element) => element.includes(contents[2])) ||
            team1.some((element) => element.includes(contents[2])) ||
            team2.some((element) => element.includes(contents[2])) ||
            captains.some((element) => element.includes(contents[2])))
        ) {
          swapNames(contents[1], contents[2]);
          updatePlayerCount();

          removeOldMsg(msg, updatedList());
        } else {
          msg.channel.send("Both players must be in the draft.");
        }
      }
    }

    if (
      msg.content === `${commandSymbol}randomizecaptain` ||
      msg.content === `${commandSymbol}randomizecaptains` ||
      msg.content === `${commandSymbol}rc`
    ) {
      if (randomizedAlready === 0) {
        let newList = allServerUsers.sort((a, b) => b.lp - a.lp);

        for (let i = 0; i < 10; i++) {
          if (newList[i]) {
            if (newList[i].userId == `<@${msg.author.id}>`) {
              isTop10 = true;
            }
          }
        }

        if (inDraft.length >= 2) {
          if (team1.length === 0 && team2.length === 0) {
            if (draftPool.length > 2) {
              if (captains.length === 2) {
                let captain1 = captains[0];
                let captain2 = captains[1];

                draftPool.push(captain1);
                captains.splice(0, 1);
                draftPool.push(captain2);
                captains.splice(0, 1);
              } else if (captains.length === 1) {
                draftPool.push(captains[0]);
                captains.splice(0, 1);
              }

              let randomNum1 = getRandomNum(draftPool.length);
              let randomNum2 = getRandomNum(draftPool.length);

              if (randomNum1 === randomNum2) {
                if (randomNum2 + 1 <= draftPool.length) {
                  randomNum2 = randomNum2 + 1;
                } else {
                  randomNum2 = randomNum2 - 1;
                }
              }
              let captain1 = draftPool[randomNum1 - 1];
              let captain2 = draftPool[randomNum2 - 1];
              while (captain1 == captain2) {
                captain2 = draftPool[randomNum2 - 1];
              }
              captains.push(captain1);
              captains.push(captain2);
              draftPool.splice(draftPool.indexOf(captain1), 1);
              draftPool.splice(draftPool.indexOf(captain2), 1);
              updatePlayerCount();
              removeOldMsg(msg, updatedList());
            } else {
              if (captains.length === 2) {
                let captain1 = captains[0];
                let captain2 = captains[1];

                inDraft.push(captain1);
                captains.splice(0, 1);
                inDraft.push(captain2);
                captains.splice(0, 1);
              } else if (captains.length === 1) {
                inDraft.push(captains[0]);
                captains.splice(0, 1);
              }

              let randomNum1 = getRandomNum(inDraft.length);
              let randomNum2 = getRandomNum(inDraft.length);

              if (randomNum1 === randomNum2) {
                if (randomNum2 + 1 <= inDraft.length) {
                  randomNum2 = randomNum2 + 1;
                } else {
                  randomNum2 = randomNum2 - 1;
                }
              }
              let captain1 = inDraft[randomNum1 - 1];
              let captain2 = inDraft[randomNum2 - 1];
              captains.push(captain1);
              captains.push(captain2);
              inDraft.splice(inDraft.indexOf(captain1), 1);
              inDraft.splice(inDraft.indexOf(captain2), 1);
              updatePlayerCount();
              removeOldMsg(msg, updatedList());
            }
          } else {
            msg.channel.send("Teams are already being chosen by captains.");
          }
        } else {
          msg.channel.send(
            "There aren't enough players to randomize captains."
          );
        }
      } else {
        msg.channel.send(
          "Teams were already randomized. \n $redraft if you wish to create new teams."
        );
      }
    }

    process.on("unhandledRejection", (error) => {
      console.error("Unhandled promise rejection:", error);
    });
    // Ranking logic
    if (command === `${commandSymbol}team1` && contents.length > 1) {
      for (let i = 1; i < contents.length; i++) {
        let temp = "";
        if (contents[i]) temp = contents[i];
        if (
          inDraft.some((ele) => ele.includes(temp)) &&
          !team1.some((ele) => ele.includes(temp))
        ) {
          inDraft.splice(
            inDraft.findIndex((ele) => ele.includes(temp)),
            1
          );
          if (!captains[0]) {
            captains.push(checkListForMedals(temp));
          } else {
            team1.push(checkListForMedals(temp));
          }
          console.log("working");
        }
      }
      updatePlayerCount();
      removeOldMsg(msg, updatedList());
    }

    if (command === `${commandSymbol}team2` && contents.length > 1) {
      for (let i = 1; i < contents.length; i++) {
        let temp = "";
        if (contents[i]) temp = contents[i];
        if (
          inDraft.some((ele) => ele.includes(temp)) &&
          !team2.some((ele) => ele.includes(temp))
        ) {
          inDraft.splice(
            inDraft.findIndex((ele) => ele.includes(temp)),
            1
          );
          if (!captains[1]) {
            captains.push(checkListForMedals(temp));
          } else {
            team2.push(checkListForMedals(temp));
          }
          console.log("working");
        }
      }
      updatePlayerCount();
      removeOldMsg(msg, updatedList());
    }

    // if (
    //   command === `${commandSymbol}dq` &&
    //   contents[2][0] == "<" &&
    //   msg.member.roles.cache.some((role) => role.name === "scorekeeper")
    // ) {
    //   // msg.client.channels.cache.get(inServerDatabase).send(`${msg.content}`);
    //   contents.map((dq) => (!dqScore.includes(dq) ? dqScore.push(dq) : null));

    //   // for (let i = 0; i < allServerUsers.length; i++) {
    //   //   if (dqScore.includes(allServerUsers[0].userId)) {

    //   //   }
    //   // }
    //   let splitScore = contents[1].split("-");

    //   win = parseInt(splitScore[0]);
    //   loss = parseInt(splitScore[1]);
    //   dqWin = win;
    //   dqLoss = loss;
    //   for (let j = 0; j < dqScore.length; j++) {
    //     let prevID = dqScore[j].split("");
    //     let newID = [];

    //     for (let k = 0; k < prevID.length; k++) {
    //       if (Number(prevID[k]) + 1) {
    //         newID.push(prevID[k]);
    //       }
    //     }

    //     newID = newID.join("");
    //     msg.guild.members.fetch(newID).then(async (member) => {
    //       let discordName;

    //       if (member.nickname !== null) {
    //         discordName = member.nickname;
    //       } else if (member.nickname === null) {
    //         discordName = member.user.username;
    //       }

    //       discordName = discordName.toUpperCase();
    //       discordName = removeSpaceChar(discordName);

    //       leaverNames.push(discordName);

    //       const updatePerson = await PlayerModel.findOne({
    //         userId: dqScore[j],
    //         guildId: msg.guild.id,
    //       });
    //       if (!updatePerson) {
    //         for (let i = 0; i < allServerUsers.length; i++) {}
    //         PlayerModel.create({
    //           guildId: msg.guild.id,
    //           userId: dqScore[j],
    //           name: discordName
    //           totalWin: 0,
    //           totalLoss: 1,
    //           win: win,
    //           loss: loss,
    //           lp: 1000 + (win - loss) * 15,
    //           value: `**${1000 + (win - loss) * 15}** (0-1)`,
    //           draftPlayed: [0, 1],
    //           lpChange: [1000, 1000 + (win - loss) * 15],
    //           bestSeason: "**None**",
    //           previousSeason: "**None**",
    //           bestRank: "0",
    //           newPlayer: true,
    //           playedSeason: true,
    //           medals: [],
    //           recentGames: [
    //             [
    //               "**LOSS**",
    //               `${(win - loss) * 15}`,
    //
    //               new Date().getTime(),
    //             ],
    //           ],
    //         }).then(async (newPlayer) => {
    //           // Wait for data to be added to the database before sending message
    //           await new Promise((resolve) => setTimeout(resolve, 1000));
    //           setTimeout(() => {
    //             msg.channel.send(
    //               `${prevID.join("")} **has been DQ'd**.\n Old MMR: **1000** (${
    //                 (win - loss) * 15 > 0 ? "+" : ""
    //               }${(win - loss) * 15}) New MMR: **${
    //                 1000 + (win - loss) * 15
    //               }**`
    //             );
    //           }, 1000);
    //         });

    //         msg.channel.send(
    //           `${prevID.join("")} **has been DQ'd**.\n Old MMR: **${
    //             allServerUsers[i].lp
    //           }** (${(win - loss) * 15 > 0 ? "+" : ""}${
    //             (win - loss) * 15
    //           }) New MMR: **${allServerUsers[i].lp + (win - loss) * 15}**`
    //         );
    //       }

    //       // for (let c = 0; c < allServerUsers.length; c++) {
    //       //   if (allServerUsers[c].userId == dqScore[j]) {
    //       //     PlayerModel.findOneAndUpdate(
    //       //       { userId: dqScore[j] },
    //       //       {
    //       //         $push: {
    //       //           draftPlayed: allServerUsers[c].draftPlayed.length,
    //       //           lpChange: 1000 + (win - loss) * 15,
    //       //         },
    //       //       }
    //       //     );
    //       //   }
    //       // }
    //       if (ifPlayerExists) {
    //         for (p = 0; p < allServerUsers.length; p++) {
    //           if (allServerUsers[p].userId == dqScore[j]) {
    //             PlayerModel.findOneAndUpdate(
    //               { userId: dqScore[j], guildId: msg.guild.id },
    //               {
    //                 $push: {
    //                   draftPlayed: allServerUsers[p].draftPlayed.length,
    //                   lpChange:
    //                     allServerUsers[p].lpChange[
    //                       allServerUsers[p].lpChange.length - 1
    //                     ] +
    //                     (win - loss) * 15,
    //                 },
    //               },
    //               { new: true }
    //             ).exec((err, data) => {
    //               if (err) throw err;
    //               playerExist = true;
    //             });
    //           }
    //         }

    //         PlayerModel.findOneAndUpdate(
    //           { userId: dqScore[j], guildId: msg.guild.id },
    //           {
    //             $inc: {
    //               totalLoss: 1,
    //               lp: (win - loss) * 15,
    //               win: win,
    //               loss: loss,
    //             },
    //           },
    //           { new: true }
    //         ).exec((err, data) => {
    //           if (err) throw err;
    //           playerExist = true;
    //         });
    //       }

    //       PlayerModel.findOneAndUpdate(
    //         { userId: dqScore[j], guildId: msg.guild.id },
    //         {
    //           $set: {
    //             name: discordName,
    //             playedSeason: true,
    //           },
    //         },
    //         { new: true }
    //       ).exec((err, data) => {
    //         if (err) throw err;
    //         playerExist = true;
    //       });

    //       for (let i = 0; i < allServerUsers.length; i++) {
    //         PlayerModel.findOneAndUpdate(
    //           { userId: allServerUsers[i].userId, guildId: msg.guild.id },
    //           {
    //             $set: {
    //               value: `**${allServerUsers[i].lp}** (${allServerUsers[i].totalWin}-${allServerUsers[i].totalLoss})`,
    //             },
    //           },
    //           { new: true }
    //         ).exec((err, data) => {
    //           if (err) throw err;
    //           playerExist = true;
    //         });
    //       }
    //     });

    //     for (let i = 0; i < allServerUsers.length; i++) {
    //       if (allServerUsers[i].userId == dqScore[j]) {
    //         msg.channel.send(
    //           `${prevID.join("")} **has been DQ'd**.\n Old MMR: **${
    //             allServerUsers[i].lp
    //           }** (${(win - loss) * 15 > 0 ? "+" : ""}${
    //             (win - loss) * 15
    //           }) New MMR: **${allServerUsers[i].lp + (win - loss) * 15}**`
    //         );
    //       }
    //     }
    //   }
    // } else if (command === `${commandSymbol}dq`) {
    //   msg.reply(`Only someone with a "scorekeeper" role may dq someone.`);
    // }

    if (
      command === `${commandSymbol}commands` ||
      command === `${commandSymbol}command` ||
      command === `${commandSymbol}help` ||
      command === `$help`
    ) {
      msg.channel.send(`
\`»» Draft List Commands ««\`
**${commandSymbol}in**: Puts you or other players in the draft.
**${commandSymbol}out**: Takes you or other players out of the draft.
**${commandSymbol}randomize**: Randomizes players into new teams.
**${commandSymbol}rc**: Randomizes captains from the draft.
**${commandSymbol}captain**: Grants you a captain role.
**${commandSymbol}uncaptain**: Removes your captain role.
**${commandSymbol}pick**: Only for Captains, pick one or more players from draft.
**${commandSymbol}swap**: Swap any 2 players in the draft.
**${commandSymbol}list**: Reveals the current draft.
**${commandSymbol}redraft/${commandSymbol}resetteam(s)**: Reset teams, and puts everyone back into draft list.
**${commandSymbol}reset**: Start a whole new draft.
**${commandSymbol}recover**: Recover the lost draft.
**${commandSymbol}ping**: Alerts everyone in the draft.
**${commandSymbol}team1**: Put players from draft list into team 1 without captain role.
**${commandSymbol}team2**: Put players from draft list into team 2 without captain role.
**${commandSymbol}time**: Shows when every player in draft list joined the draft, and by who.
**${commandSymbol}next**: Puts you next in line for the next draft.
**${commandSymbol}nextlist**: Shows next draft list.
**${commandSymbol}vote**: Vote for a captain from the draft list. When ready $rc to find new captains.
**${commandSymbol}banlist**: Check which players are banned from using the bot.
**${commandSymbol}flip**: Flips heads or tails.\n
`);
      msg.channel.send(" ");
      msg.channel.send(`\n
\`»» MMR Commands ««\`
**${commandSymbol}ranks**: Shows leaderboard.
**${commandSymbol}stats**: Shows players stats.
**${commandSymbol}sm**: Short for "Score Match". scorekeeper's may score players using format below.
**Score Match Format**: e.g. $sm 9-0 @winnernames and $sm 0-9 @losernames.
`);
      msg.channel.send(" ");

      msg.channel.send(`
\`»» Special Commands ««\`
**${commandSymbol}lock**: Captains or scorekeeper's may lock a draft when captains begin to pick players.
**${commandSymbol}unlock**: Captains or scorekeeper's may unlock a draft incase of an emergency.
**${commandSymbol}ban/unban**: scorekeeper's may ban or unban a member from interacting with the bot.
**${commandSymbol}newseason**: Server owner, you may end the season and reset leaderboard and scores.
**${commandSymbol}sync**: scorekeeper's, if the channels, "draft-results" or "season-leaders" are deleted, recreate them and type $sync to reconnect them.\n
**${commandSymbol}help**: Reveals bot commands.
`);
    }
    if (command === `${commandSymbol}banlist`) {
      let bannedPlayers = banList.join(", ");
      if (bannedPlayers.length > 0) {
        msg.channel.send(`Banned Players: ${bannedPlayers}`);
      } else {
        msg.reply("There are no banned players.");
      }
    }

    if (
      command === `${commandSymbol}sm` &&
      contents.length > 1 &&
      msg.member.roles.cache.some((role) => role.name === "scorekeeper")
    ) {
      try {
        const gameChannel = msg.guild.channels.cache.get(gameScoreChannel);
        if (gameChannel) {
          console.log("CONTEENTS", contents);
          console.log("regular Score before", regularScore);
          regularScore = [];
          contents.forEach((playerDiscordId) =>
            !regularScore.includes(playerDiscordId) &&
            playerDiscordId.length > 18
              ? regularScore.push(playerDiscordId)
              : null
          );
          console.log("regular Score after", regularScore);

          let splitScore = contents[1].split("-");

          win = parseInt(splitScore[0]);
          loss = parseInt(splitScore[1]);
          regularWin = win;
          regularLoss = loss;

          if (regularScore.length > 0 && win < 1000 && loss < 1000) {
            let temp = [];

            for (let j = 0; j < regularScore.length; j++) {
              let prevID = regularScore[j].split("");
              let newID = [];
              prevID.map((a) => (parseInt(a) + 1 ? newID.push(a) : null));

              newID = newID.join("");
              const updatePerson = await PlayerModel.findOne({
                userId: regularScore[j],
                guildId: msg.guild.id,
              });
              if (updatePerson) {
                msg.guild.members.fetch(newID).then((member) => {
                  let discordName;

                  if (member.nickname !== null) {
                    discordName = member.nickname;
                  } else if (member.nickname === null) {
                    discordName = member.user.username;
                  }

                  discordName = discordName.toUpperCase();
                  discordName = removeSpaceChar(discordName);

                  if (regularWin > regularLoss) {
                    winnerNames.push(discordName);

                    for (p = 0; p < allServerUsers.length; p++) {
                      if (allServerUsers[p].userId == regularScore[j]) {
                        PlayerModel.findOneAndUpdate(
                          {
                            userId: regularScore[j],
                            guildId: msg.guild.id,
                          },
                          {
                            $push: {
                              draftPlayed: allServerUsers[p].draftPlayed.length,
                              lpChange:
                                allServerUsers[p].lpChange[
                                  allServerUsers[p].lpChange.length - 1
                                ] +
                                (regularWin - regularLoss) * 15,
                              recentGames: [
                                "**WIN**",
                                `+${(regularWin - regularLoss) * 15}`,

                                new Date().getTime(),
                              ],
                            },
                          },
                          { new: true }
                        ).exec((err, data) => {
                          if (err) throw err;
                          playerExist = true;
                        });
                      }
                    }

                    PlayerModel.findOneAndUpdate(
                      {
                        userId: regularScore[j],
                        guildId: msg.guild.id,
                      },
                      {
                        $inc: {
                          totalWin: 1,
                          lp: (regularWin - regularLoss) * 15,
                          win: regularWin,
                          loss: regularLoss,
                        },
                      },
                      { new: true }
                    ).exec((err, data) => {
                      if (err) throw err;
                      playerExist = true;
                    });
                  } else if (regularWin < regularLoss) {
                    loserNames.push(discordName);

                    for (p = 0; p < allServerUsers.length; p++) {
                      if (allServerUsers[p].userId == regularScore[j]) {
                        PlayerModel.findOneAndUpdate(
                          {
                            userId: regularScore[j],
                            guildId: msg.guild.id,
                          },
                          {
                            $push: {
                              draftPlayed: allServerUsers[p].draftPlayed.length,
                              lpChange:
                                allServerUsers[p].lpChange[
                                  allServerUsers[p].lpChange.length - 1
                                ] +
                                (regularWin - regularLoss) * 15,
                              recentGames: [
                                "**LOSS**",
                                `${(regularWin - regularLoss) * 15}`,

                                new Date().getTime(),
                              ],
                            },
                          },
                          { new: true }
                        ).exec((err, data) => {
                          if (err) throw err;
                          playerExist = true;
                        });
                      }
                    }

                    PlayerModel.findOneAndUpdate(
                      {
                        userId: regularScore[j],
                        guildId: msg.guild.id,
                      },
                      {
                        $inc: {
                          totalLoss: 1,
                          lp: (regularWin - regularLoss) * 15,
                          win: regularWin,
                          loss: regularLoss,
                        },
                      },
                      { new: true }
                    ).exec((err, data) => {
                      if (err) throw err;
                      playerExist = true;
                    });
                  }

                  let newList = allServerUsers.sort((a, b) => b.lp - a.lp);
                  let finalList = [];
                  newList.map((a) =>
                    a.playedSeason ? finalList.push(a) : null
                  );

                  for (let i = 0; i < allServerUsers.length; i++) {
                    let rankZ = 0;
                    for (let j = 0; j < finalList.length; j++) {
                      if (finalList[j].userId == allServerUsers[i].userId) {
                        rankZ = j + 1;
                      }
                    }
                    if (rankZ > 0) {
                      playersToEditRoles.push({
                        id: newID,
                        role: turnMmrToTitle2(rankZ, finalList.length),
                      });
                    }
                  }

                  PlayerModel.findOneAndUpdate(
                    {
                      userId: regularScore[j],
                      guildId: msg.guild.id,
                    },
                    {
                      $set: {
                        name: discordName,
                        playedSeason: true,
                      },
                    },
                    { new: true }
                  ).exec((err, data) => {
                    if (err) throw err;
                    playerExist = true;
                  });

                  for (let i = 0; i < allServerUsers.length; i++) {
                    PlayerModel.findOneAndUpdate(
                      {
                        userId: allServerUsers[i].userId,
                        guildId: msg.guild.id,
                      },
                      {
                        $set: {
                          value: `**${allServerUsers[i].lp}** (${allServerUsers[i].totalWin}-${allServerUsers[i].totalLoss})`,
                        },
                      },
                      { new: true }
                    ).exec((err, data) => {
                      if (err) throw err;
                      playerExist = true;
                    });
                  }
                });

                for (let i = 0; i < allServerUsers.length; i++) {
                  if (allServerUsers[i].userId == regularScore[j]) {
                    temp.push(
                      `${prevID.join("")} \`Old MMR: ${allServerUsers[i].lp} (${
                        (win - loss) * 15 > 0 ? "+" : ""
                      }${(win - loss) * 15}) New MMR: ${
                        allServerUsers[i].lp + (win - loss) * 15
                      }\``
                    );
                  }
                }
              } else {
                msg.guild.members.fetch(newID).then((member) => {
                  let discordName;

                  if (member.nickname !== null) {
                    discordName = member.nickname;
                  } else if (member.nickname === null) {
                    discordName = member.user.username;
                  }

                  discordName = discordName.toUpperCase();
                  discordName = removeSpaceChar(discordName);

                  if (regularWin > regularLoss) {
                    winnerNames.push(discordName);

                    PlayerModel.create({
                      guildId: msg.guild.id,
                      userId: regularScore[j],
                      name: discordName,
                      totalWin: 1,
                      totalLoss: 0,
                      win: regularWin,
                      loss: regularLoss,
                      lp: 1000 + (regularWin - regularLoss) * 15,
                      value: `**${
                        1000 + (regularWin - regularLoss) * 15
                      }** (1-0)`,
                      draftPlayed: [0, 1],
                      lpChange: [1000, 1000 + (regularWin - regularLoss) * 15],
                      bestSeason: "**None**",
                      previousSeason: "**None**",
                      newPlayer: true,
                      playedSeason: true,
                      medals: [],
                      recentGames: [
                        [
                          "**WIN**",
                          `+${(regularWin - regularLoss) * 15}`,

                          new Date().getTime(),
                        ],
                      ],
                    }).then(async (newPlayer) => {
                      // Wait for data to be added to the database before sending message
                      await new Promise((resolve) => setTimeout(resolve, 1000));
                      setTimeout(() => {
                        temp.push(
                          `${prevID.join("")} \`Old MMR: 1000 (${
                            (win - loss) * 15 > 0 ? "+" : ""
                          }${(win - loss) * 15}) New MMR: ${
                            1000 + (win - loss) * 15
                          }\``
                        );
                      }, 500);
                    });
                  } else if (regularWin < regularLoss) {
                    loserNames.push(discordName);

                    PlayerModel.create({
                      guildId: msg.guild.id,
                      userId: regularScore[j],
                      name: discordName,
                      totalWin: 0,
                      totalLoss: 1,
                      win: regularWin,
                      loss: regularLoss,
                      lp: 1000 + (regularWin - regularLoss) * 15,
                      value: `**${
                        1000 + (regularWin - regularLoss) * 15
                      }** (0-1)`,
                      draftPlayed: [0, 1],
                      lpChange: [1000, 1000 + (regularWin - regularLoss) * 15],
                      bestSeason: "**None**",
                      previousSeason: "**None**",
                      newPlayer: true,
                      playedSeason: true,
                      medals: [],
                      recentGames: [
                        [
                          "**LOSS**",
                          `${(regularWin - regularLoss) * 15}`,

                          new Date().getTime(),
                        ],
                      ],
                    }).then(async (newPlayer) => {
                      // Wait for data to be added to the database before sending message
                      await new Promise((resolve) => setTimeout(resolve, 1000));
                      setTimeout(() => {
                        temp.push(
                          `${prevID.join("")} \`Old MMR: 1000 (${
                            (win - loss) * 15 > 0 ? "+" : ""
                          }${(win - loss) * 15}) New MMR: ${
                            1000 + (win - loss) * 15
                          }\``
                        );
                      }, 500);
                    });
                  }
                });
              }
            }

            setTimeout(async () => {
              regularScore = [];
              winnerNames = [];
              loserNames = [];
              regularWin = 0;
              regularLoss = 0;
              let updatedScoresEmbed = new Discord.MessageEmbed()
                .setColor("#6482d0")
                .setTitle(
                  `Score: \`${win}-${loss}\` \`${
                    win > loss ? "WIN" : "LOSE"
                  }\` ${win > loss ? "🟢" : "🔴"}`
                )
                .setDescription(`${temp.join("\n")}`)
                .setTimestamp();

              msg.channel.send({ embeds: [updatedScoresEmbed] });
              // msg.channel.send("$sd");

              try {
                const gameChannel =
                  msg.guild.channels.cache.get(gameScoreChannel);
                if (gameChannel) {
                  msg.client.channels.cache
                    .get(gameScoreChannel)
                    .send({ embeds: [updatedScoresEmbed] });
                } else {
                  msg.channel.send(
                    `Scores are updated. But, "draft-results" channel not found. Please recreate and type $sync to reconnect to keep track of draft records. `
                  );
                }
              } catch (err) {
                console.log(err);
              }
            }, 1000);

            updateLeaderboard();
          }
        } else {
          const warningEmbed = new Discord.MessageEmbed()
            .setColor("#0099ff")
            .setTitle(`Warning ⚠️`)
            .setDescription(
              "Unable to find the 'draft-results' channel. Please create a channel named 'draft-results' and then type $sync to establish a connection for tracking each drafts. After syncing, the $sm command will become functional."
            );
          msg.channel.send({ embeds: [warningEmbed] });
        }
      } catch (err) {
        console.log(err);
      }
    } else if (command === `${commandSymbol}sm`) {
      msg.reply(`Only someone with a "scorekeeper" role may score matches.`);
    }

    if (
      command === `${commandSymbol}sd` &&
      msg.member.roles.cache.some((role) => role.name === "scorekeeper")
    ) {
      console.log("team1ScoreCopy" + team1ScoreCopy);
      console.log("team2ScoreCopy" + team2ScoreCopy);

      winnerNames = [];
      loserNames = [];
      leaverNames = [];
      team1Score = [];
      team2Score = [];
      team1ScoreCopy = [];
      team2ScoreCopy = [];
      dqScore = [];
      team1Win = 0;
      team1Loss = 0;
      team2Win = 0;
      team2Loss = 0;
      dqWin = 0;
      dqLoss = 0;
      msg.delete();
    }

    if (
      command === `${commandSymbol}time` ||
      command === `${commandSymbol}timeall`
    ) {
      let result = [];

      for (let i = 0; i < playerAndTime.length; i++) {
        let player = playerAndTime[i];
        let yourping = msg.createdTimestamp;
        let d = new Date(yourping);
        let currentHour = d.getHours();
        let currentMin = d.getMinutes();

        let playerLogHour = parseInt(player.time[0]);
        let playerLogMin = parseInt(player.time[1]);

        // Calculate the time difference in minutes
        let diffInMinutes =
          currentHour * 60 + currentMin - (playerLogHour * 60 + playerLogMin);

        let remainingHour = Math.floor(diffInMinutes / 60);
        let remainingMin = diffInMinutes % 60;

        player.remainingTime = [remainingHour, remainingMin];

        let enteredByString =
          player.enteredBy == "self" ? "." : `, by <@${player.enteredBy}>.`;

        if (remainingHour === 0) {
          if (remainingMin === 1) {
            result.push(
              `**${player.name}** joined the draft **${remainingMin}** minute ago${enteredByString}\n`
            );
          } else {
            result.push(
              `**${player.name}** joined the draft **${remainingMin}** minutes ago${enteredByString}\n`
            );
          }
        } else if (remainingHour === 1) {
          result.push(
            `**${player.name}** joined the draft **${remainingHour}** hour and **${remainingMin}** minutes ago${enteredByString}\n`
          );
        } else {
          result.push(
            `**${player.name}** joined the draft **${remainingHour}** hours and **${remainingMin}** minutes ago${enteredByString}\n`
          );
        }
      }

      if (result.length > 0) {
        msg.channel.send(result.join(""));
      } else {
        msg.channel.send("No players were found in the draft.");
      }
    }

    if (
      command === `${commandSymbol}history` ||
      command === `${commandSymbol}stat` ||
      command === `${commandSymbol}stats`
    ) {
      if (contents.length == 1) {
        for (let i = 0; i < allServerUsers.length; i++) {
          if (allServerUsers[i].userId == `<@${msg.author.id}>`) {
            addDataToChart(
              msg,
              allServerUsers[i].lpChange,
              allServerUsers[i].draftPlayed,
              msg.author.id,
              client
            );
          }
        }
      } else if (contents.length == 2) {
        let prevID = contents[1];
        let newID = [];

        for (let i = 0; i < prevID.length; i++) {
          if (Number(prevID[i]) + 1) {
            newID.push(prevID[i]);
          }
        }

        for (let i = 0; i < allServerUsers.length; i++) {
          if (allServerUsers[i].userId == contents[1]) {
            addDataToChart(
              msg,
              allServerUsers[i].lpChange,
              allServerUsers[i].draftPlayed,
              newID.join("")
            );
          }
        }
      }
    }

    if (
      command === `${commandSymbol}ranks` ||
      command === `${commandSymbol}rank` ||
      command === `${commandSymbol}leaderboard`
    ) {
      updateLeaderboard();

      let newList = allServerUsers.sort((a, b) => b.lp - a.lp);
      let finalList = [];
      newList.map((a) => (a.playedSeason ? finalList.push(a) : null));

      let sortedList = [];
      const monospaceDigits = {
        0: "𝟶",
        1: "𝟷",
        2: "𝟸",
        3: "𝟹",
        4: "𝟺",
        5: "𝟻",
        6: "𝟼",
        7: "𝟽",
        8: "𝟾",
        9: "𝟿",
      };
      function toNAryNumber(number) {
        return number
          .toString()
          .split("")
          .map((digit) => monospaceDigits[digit])
          .join("");
      }
      // const nbsp = "\u00A0".repeat(3);
      // let
      for (let i = 0; i < finalList.length; i++) {
        if (i === 0) {
          console.log("A", String(i + 1).slice(-1));
          sortedList.push(
            `:first_place: ${turnMmrToTitle2(i, finalList.length)} ${
              finalList[i].userId
            } ${finalList[i].value}`
          );
        } else if (i === 1) {
          sortedList.push(
            `:second_place: ${turnMmrToTitle2(i, finalList.length)} ${
              finalList[i].userId
            } ${finalList[i].value}`
          );
        } else if (i === 2) {
          sortedList.push(
            `:third_place: ${turnMmrToTitle2(i, finalList.length)} ${
              finalList[i].userId
            } ${finalList[i].value}\n`
          );

          // if (i === 2) sortedList.push('\n');
        } else if ((i + 1) % 10 == 0 && finalList.length > 20) {
          console.log("B", String(i + 1).slice(-1));

          sortedList.push(
            `${toNAryNumber(i + 1)}. ${turnMmrToTitle2(i, finalList.length)} ${
              finalList[i].userId
            } ${finalList[i].value}`
          );
        } else {
          if (i + 1 < 10) {
            sortedList.push(
              `\u2009\u2009\u200A\u200A${toNAryNumber(
                i + 1
              )}. ${turnMmrToTitle2(i, finalList.length)} ${
                finalList[i].userId
              } ${finalList[i].value}`
            );
          } else {
            sortedList.push(
              `${toNAryNumber(i + 1)}. ${turnMmrToTitle2(
                i,
                finalList.length
              )} ${finalList[i].userId} ${finalList[i].value}`
            );
          }
        }
      }
      let hasPlayers;
      finalList.length > 0 ? (hasPlayers = true) : (hasPlayers = false);

      if (sortedList.length > 40) {
        let list1 = sortedList.slice(0, sortedList.length / 2);
        let list2 = sortedList.slice(sortedList.length / 2, sortedList.length);

        let embed1 = new Discord.MessageEmbed()
          .setColor("#6482d0")
          .setTitle("**:crown: Leaderboard :crown:\n**")
          .setURL("https://discord.js.org")
          .setDescription(
            hasPlayers ? list1.join(`\n `) : "No scores have been added yet."
          );

        let embed2 = new Discord.MessageEmbed()
          .setColor("#0099ff")
          .setDescription(
            hasPlayers ? list2.join(`\n`) : "No scores have been added yet."
          );
        msg.channel.send({ embeds: [embed1] });
        msg.channel.send({ embeds: [embed2] });

        checkIfPlayerPlayed = true;
      } else if (sortedList.length > 0) {
        // let list1 = sortedList.slice(0, sortedList.length / 2);
        // let list2 = sortedList.slice(
        //   sortedList.length / 2,
        //   sortedList.length
        // );

        let embed1 = new Discord.MessageEmbed()
          .setColor("#6482d0")
          .setTitle("**:crown: Leaderboard :crown:\n**")
          .setURL("https://discord.js.org")
          .setDescription(
            hasPlayers
              ? sortedList.join(`\n`)
              : "No scores have been added yet."
          );
        console.log("LIST Z LENGTH", sortedList.length);
        msg.channel.send({ embeds: [embed1] });

        checkIfPlayerPlayed = true;
      } else {
        msg.channel.send("There are no scores yet.");
      }
    }
    if (
      command === `${commandSymbol}sync` &&
      (msg.author.id == currentServer[0].guildOwnerId ||
        msg.member.roles.cache.some((role) => role.name === "scorekeeper"))
    ) {
      const checkOrCreateChannel = async (channelName) => {
        const channel = msg.guild.channels.cache.find(
          (channel) => channel.name === channelName
        );
        console.log("CHANNEL FOUND ID", channel.id);
        if (channelName === "draft-results") {
          gameScoreChannel = channel.id;
          await AllServers.findOneAndUpdate(
            { guildId: msg.guild.id },
            {
              $set: {
                guildDraftResultChannel: channel.id,
              },
            }
          );
        } else if (channelName === "season-leaders") {
          seasonWinnersChannel = channel.id;
          await AllServers.findOneAndUpdate(
            { guildId: msg.guild.id },
            {
              $set: {
                guildWinnersChannel: channel.id,
              },
            }
          );
        }

        console.log(`Using existing ${channelName} channel`);
        return channel;
      };
      checkOrCreateChannel("draft-results");
      checkOrCreateChannel("season-leaders");

      msg.channel.send("Channels have been synced!");
    } else if (command === `${commandSymbol}sync`) {
      msg.reply(
        `Only Server Owner or scorekeeper's may $sync the missing channels. Type $help for assistance.`
      );
    }

    if (
      command === `${commandSymbol}newseason` &&
      msg.author.id == currentServer[0].guildOwnerId
    ) {
      try {
        const sznWinnerChannel =
          msg.guild.channels.cache.get(seasonWinnersChannel);
        if (sznWinnerChannel) {
          let temp = [];
          let newList = allServerUsers.sort((a, b) => b.lp - a.lp);
          let finalList = [];
          let didNotPlayList = [];

          newList.map((a) => (a.playedSeason ? finalList.push(a) : null));
          newList.map((a) => (!a.playedSeason ? didNotPlayList.push(a) : null));

          for (let i = 0; i < allServerUsers.length; i++) {
            let rankZ = 0;
            for (let j = 0; j < finalList.length; j++) {
              if (finalList[j].userId == allServerUsers[i].userId) {
                rankZ = j + 1;
              }
            }
            console.log(`${allServerUsers[i]}'s rank: ${rankZ}`);
            console.log(`${allServerUsers[i]}'s lp: ${allServerUsers[i].lp}`);
            console.log(
              `${allServerUsers[i]}'s bestSeason lp: ${
                allServerUsers[i].bestSeason.split(" ")[2]
              }`
            );

            if (
              (allServerUsers[i].lp >
                parseInt(allServerUsers[i].bestSeason.split(" ")[2]) ||
                allServerUsers[i].newPlayer) &&
              allServerUsers[i].playedSeason
            ) {
              PlayerModel.findOneAndUpdate(
                { userId: allServerUsers[i].userId, guildId: msg.guild.id },
                {
                  $set: {
                    bestSeason: `${turnMmrToTitle2(
                      rankZ,
                      finalList.length
                    )} · ${allServerUsers[i].lp} · #${rankZ}`,
                    previousSeason: allServerUsers[i].playedSeason
                      ? `${turnMmrToTitle2(rankZ, finalList.length)} · ${
                          allServerUsers[i].lp
                        } · #${rankZ}`
                      : `None`,
                    medals: [
                      turnMmrToTitle2(rankZ, finalList.length),
                      ...allServerUsers[i].medals,
                    ],
                    totalWin: 0,
                    totalLoss: 0,
                    win: 0,
                    loss: 0,
                    bestRank: `${rankZ} ${finalList.length}`,
                    value: `**1000** (0-0)`,
                    draftPlayed: [0],
                    lpChange: [1000],
                    lp: 1000,
                    newPlayer: false,
                    playedSeason: false,
                    recentGames: [],
                  },
                },
                { new: true }
              ).exec((err, data) => {
                if (err) throw err;
                playerExist = true;
              });
            } else if (
              allServerUsers[i].lp <=
                parseInt(allServerUsers[i].bestSeason.split(" ")[2]) &&
              allServerUsers[i].playedSeason
            ) {
              PlayerModel.findOneAndUpdate(
                { userId: allServerUsers[i].userId, guildId: msg.guild.id },
                {
                  $set: {
                    previousSeason: allServerUsers[i].playedSeason
                      ? `${turnMmrToTitle2(rankZ, finalList.length)} · ${
                          allServerUsers[i].lp
                        } · #${rankZ}`
                      : `None`,
                    medals: [
                      turnMmrToTitle2(rankZ, finalList.length),
                      ...allServerUsers[i].medals,
                    ],
                    totalWin: 0,
                    totalLoss: 0,
                    win: 0,
                    loss: 0,
                    value: `**1000** (0-0)`,
                    draftPlayed: [0],
                    lpChange: [1000],
                    lp: 1000,
                    playedSeason: false,
                    recentGames: [],
                  },
                },
                { new: true }
              ).exec((err, data) => {
                if (err) throw err;
                playerExist = true;
              });
            } else {
              PlayerModel.findOneAndUpdate(
                { userId: allServerUsers[i].userId, guildId: msg.guild.id },
                {
                  $set: {
                    previousSeason: `None`,
                  },
                },
                { new: true }
              ).exec((err, data) => {
                if (err) throw err;
                playerExist = true;
              });
            }
          }
          let sortUsers = allServerUsers.sort((a, b) => b.lp - a.lp);
          let top3Users = [];
          sortUsers.map((a) => (a.playedSeason ? top3Users.push(a) : null));

          let sortedList = [];

          for (let i = 0; i < top3Users.length; i++) {
            if (i === 0) {
              sortedList.push(
                ` :first_place: ${turnMmrToTitle(
                  top3Users[i].lp,
                  i,
                  top3Users.length
                )} ${top3Users[i].userId} ${top3Users[i].value}\n`
              );
            } else if (i === 1) {
              sortedList.push(
                ` :second_place: ${turnMmrToTitle(
                  top3Users[i].lp,
                  i,
                  top3Users.length
                )} ${top3Users[i].userId} ${top3Users[i].value}\n`
              );
            } else if (i === 2) {
              sortedList.push(
                ` :third_place: ${turnMmrToTitle(
                  top3Users[i].lp,
                  i,
                  top3Users.length
                )} ${top3Users[i].userId} ${top3Users[i].value}\n`
              );

              // if (i === 2) sortedList.push('\n');
            }
          }
          const seasonEndEmbed = new Discord.MessageEmbed()
            .setColor("#0099ff")
            .setTitle(`:crown: Season Winners :crown:`)
            .setDescription(sortedList.join("\n"))
            .setTimestamp();

          msg.client.channels.cache
            .get(seasonWinnersChannel)
            .send({ embeds: [seasonEndEmbed] });
          msg.channel.send("**Season has been reset!**");
        } else {
          const warningEmbed = new Discord.MessageEmbed()
            .setColor("#0099ff")
            .setTitle(`Warning ⚠️`)
            .setDescription(
              "Unable to find the 'season-leaders' channel. Please create a channel named 'season-leaders' and then type $sync to establish a connection for tracking season leaders. After syncing, the $newseason command will become functional."
            );
          msg.channel.send({ embeds: [warningEmbed] });
        }
      } catch (err) {
        console.log(err);
      }
      // msg.client.channels.cache
      //   .get(seasonWinnersChannel)
      //   .send({ embeds: [seasonEndEmbed] });
    } else if (command === `${commandSymbol}newseason`) {
      msg.channel.send(
        `Only <@${currentServer[0].guildOwnerId}> (Server Owner) can reset season.`
      );
    } else if (command === `${commandSymbol}resetseason`) {
      msg.channel.send("Command has changed to $newseason.");
    }

    if (command === `${commandSymbol}bottom10`) {
      if (allServerUsers.length >= 11) {
        for (let i = 0; i < allServerUsers.length; i++) {
          PlayerModel.findOneAndUpdate(
            { userId: allServerUsers[i].userId, guildId: msg.guild.id },
            {
              $set: {
                value: `**${allServerUsers[i].lp}** (${allServerUsers[i].totalWin}-${allServerUsers[i].totalLoss})`,
              },
            },
            { new: true }
          ).exec((err, data) => {
            if (err) throw err;
            playerExist = true;
          });
        }

        let newList = allServerUsers.sort((a, b) => b.lp - a.lp);

        let sortedList = [];

        for (let i = newList.length - 10; i < newList.length; i++) {
          sortedList.push(
            ` ${i + 1}.  **${newList[i].name}**    ${newList[i].value}`
          );
        }

        let hasPlayers;
        newList.length > 1 ? (hasPlayers = true) : (hasPlayers = false);

        if (sortedList.length > 0) {
          const newEmbed = new Discord.MessageEmbed()
            .setColor("#0099ff")
            .setTitle("**:crown: Leaderboard :crown:\n**")
            .setDescription(
              hasPlayers
                ? sortedList.join(`\n`)
                : "No scores have been added yet."
            );

          msg.channel.send({ embeds: [newEmbed] });
          checkIfPlayerPlayed = true;
        } else {
          msg.channel.send("There are no scores yet.");
        }
      } else {
        msg.channel.send("Not enough players for bottom feeders list.");
      }
    }

    if (command === `${commandSymbol}top10`) {
      allServerUsers = allUsers.filter((player) => {
        return player.guildId === msg.guild.id;
      });
      if (allServerUsers.length >= 11) {
        for (let i = 0; i < allServerUsers.length; i++) {
          PlayerModel.findOneAndUpdate(
            { userId: allServerUsers[i].userId, guildId: msg.guild.id },
            {
              $set: {
                value: `**${allServerUsers[i].lp}** (${allServerUsers[i].totalWin}-${allServerUsers[i].totalLoss})`,
              },
            },
            { new: true }
          ).exec((err, data) => {
            if (err) throw err;
            playerExist = true;
          });
        }

        let newList = allServerUsers.sort((a, b) => b.lp - a.lp);

        let sortedList = [];

        for (let i = 0; i < 10; i++) {
          if (i === 0) {
            sortedList.push(
              ` **${i + 1}.**   **${newList[i].name}**    ${
                newList[i].value
              } \n`
            );
          } else if (i === 1) {
            sortedList.push(
              ` **${i + 1}.**  **${newList[i].name}**    ${newList[i].value} \n`
            );
          } else if (i === 2) {
            sortedList.push(
              ` **${i + 1}.**  **${newList[i].name}**    ${newList[i].value} \n`
            );
            // if (i === 2) sortedList.push('\n');
          } else if (i === 9 && newList.length > 11) {
            sortedList.push(
              ` ${i + 1}.  **${newList[i].name}**    ${newList[i].value} \n`
            );
          } else {
            sortedList.push(
              ` ${i + 1}.  **${newList[i].name}**    ${newList[i].value}`
            );
          }
        }

        let hasPlayers;
        newList.length > 1 ? (hasPlayers = true) : (hasPlayers = false);

        if (sortedList.length > 0) {
          const newEmbed = new Discord.MessageEmbed()
            .setColor("#0099ff")
            .setTitle("**:crown: Leaderboard :crown:\n**")
            .setDescription(
              hasPlayers
                ? sortedList.join(`\n`)
                : "No scores have been added yet."
            );

          msg.channel.send({ embeds: [newEmbed] });
          checkIfPlayerPlayed = true;
        } else {
          msg.channel.send("There are no scores yet.");
        }
      } else {
        msg.channel.send("Not enough players for top 10 list.");
      }
    }

    // Draft-Tracker Channel
    // if (msg.author.id === discordBotId && msg.content.includes("#")) {
    //   const postDraftEmbed = new Discord.MessageEmbed()
    //     .setColor("#0099ff")
    //     .setTitle(`Draft #${draftNum}`)
    //     .setDescription(
    //       `\n Score: **${team1Win}-${team2Win}** \n\n Winners (**${team1Win}-${team2Win}**): **${winnerNames.join(
    //         " · "
    //       )}** \nLosers (**${team2Win}-${team2Loss}**): **${loserNames.join(
    //         " · "
    //       )}**`
    //     )
    //     .setTimestamp();

    //   AllServers.find().then((allServers) => {
    //     currentServer = allServers.filter(
    //       (server) => server.guildId === allServerUsers[0].guildId
    //     );
    //   });

    //   msg.client.channels.cache
    //     .get(gameScoreChannel)
    //     .send({ embeds: [postDraftEmbed] });

    //   setTimeout(() => msg.channel.send("$sd"), 5000);

    //   winAfterLeaver = 0;
    //   lossAfterLeaver = 0;
    //   containsLeaver1 = false;
    //   currentLoss = 0;
    //   currentWin = 0;
    // }

    if (command === `${commandSymbol}vote`) {
      if (
        !voted.some((ele) => ele.includes(msg.author.id)) &&
        contents.length > 1
      ) {
        if (inDraft.some((ele) => ele.includes(contents[1]))) {
          // msg.guild.members.fetch(msg.author.id).then((member) => {
          //   var discordName;
          //   if (member.nickname !== null) {
          //     discordName = member.nickname;
          //   } else if (member.nickname === null) {
          //     discordName = member.user.username;
          //   }

          //   discordName = discordName.toUpperCase();
          //   discordName = removeSpaceChar(discordName);

          //   if (contents[1].toUpperCase() == discordName) {
          if (contents[1] === msg.author.id) {
            msg.channel.send(`You can't vote for yourself.`);
          } else if (!draftPool.includes(contents[1])) {
            voted.push(msg.author.id);
            draftPool.push(contents[1]);
            msg.channel.send(
              `**${
                contents[1]
              }** has been added to the Captain's Pool.\n\nCurrent Captain's Pool: **${draftPool.join(
                ", "
              )}**`
            );
          } else if (draftPool.includes(contents[1])) {
            msg.channel.send(
              `**${contents[1]}** is already in the Captain's Pool.`
            );
          }
        } else {
          msg.channel.send(`**${contents[1]}** is not in the Draft List.`);
        }
      } else {
        msg.channel.send(`You already voted for a captain.`);
      }
    }

    if (
      command === `${commandSymbol}ban` &&
      msg.member.roles.cache.some((role) => role.name === "scorekeeper")
    ) {
      if (contents.length == 1) {
        msg.reply("Who shall I ban from drafts?");
      } else if (
        contents.length > 1 &&
        contents[1][0] === "<" &&
        contents[1][contents[1].length - 1] === ">"
      ) {
        const extractUserId = (str) => str.replace(/\D+/g, "");
        const userId = extractUserId(contents[1]);
        if (contents[1] === `<@${currentServer[0].guildOwnerId}>`) {
          msg.reply("You can't ban the Server Owner.");
        } else if (
          msg.guild.members.cache
            .get(userId)
            .roles.cache.some((role) => role.name === "scorekeeper")
        ) {
          msg.reply("You can't ban scorekeeper's.");
        } else if (contents[1] == `<@${discordBotId}>`) {
          msg.reply("You can't ban me.");
        } else {
          banList.push(contents[1]);
          msg.channel.send(
            `${contents[1]} has been banned from further drafts.`
          );
        }
      } else {
        msg.channel.send("Please @ the person whom you wish to ban.");
      }
    } else if (command === `${commandSymbol}ban`) {
      msg.channel.send(`Only scorekeeper's may ban someone.`);
    }

    if (
      command == `${commandSymbol}unban` &&
      msg.member.roles.cache.some((role) => role.name === "scorekeeper")
    ) {
      banList = banList.filter((member) => member !== contents[1]);

      msg.channel.send(`${contents[1]} has been unbanned from drafts.`);
    } else if (command === `${commandSymbol}unban`) {
      msg.channel.send(`Only scorekeeper's may unban someone.`);
    }

    // if (msg.author.id === discordBotId && msg.content.includes(peopleSymbol)) {
    //   if (lastMsg !== msg.id) {
    //     lastMsg = msg.id;
    //   } else {
    //     lastMsgCopy = msg.id;
    //   }
    // }

    if (msg.author.id == discordBotId && msg.embeds.length > 0) {
      const embed = msg.embeds[0];
      const team2Field = embed.fields.find((field) =>
        field.name.includes("Team 2")
      ); // Find the field with "Team 2"
      if (!lastMsg.includes(msg.id)) {
        lastMsg.push(msg.id);
        console.log("lastMsg b", msg.id);
        console.log("lastMsgs", lastMsg);

        // msg.channel.send(`${msg.id}`);
      } else {
        lastMsgCopy = msg.id;
        console.log(lastMsgCopy);
      }
    }

    if (msg.author.id == discordBotId && !msg.content.includes(peopleSymbol)) {
      if (lastRankMsg !== msg.id) {
        lastRankMsg = msg.id;
        if (lastRankMsgCopy.length == 0) lastRankMsgCopy = msg.id;
        console.log(`Message ID ${msg.id}`);
      } else {
        console.log(lastRankMsgCopy);
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
