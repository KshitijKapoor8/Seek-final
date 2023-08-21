const axios = require("axios");
const aws = require("aws-sdk");

// axios.defaults.headers.common['Authorization'] = 'key=AAAAk8SbLtE:APA91bGyHZMJOd_kx3c2gWAHpLQl6HT9Rv82EsoNKa7Kfhf_VdMvkI3zXoWK1LdDbChF0-Ojv55UTWq_ls_cwvPxK8uCtC6yRV-TE3zKzw9h54Mj0RrfJptG-LA1R1s-cbrmysf2hR0M';
// axios.defaults.headers.post['Content-Type'] = 'application/json';

const lambda = new aws.Lambda({
  region: "us-east-1",
  accessKeyId: "",
  secretAccessKey: "",
});

const getFriendData = async (messages) => {
  const validMatches = [];
  const lambdaInfo = [];

  try {
    const res = await axios.get("http://hihello.asuscomm.com:3000/friends");

    for (const friend of res.data) {
      const temp = {
        user_id: friend.user_id,
        friend_id: friend.friend_id,
      };

      const userRes = await axios.post("http://hihello.asuscomm.com:3000/users/getById", { id: temp.user_id });
      if (userRes.data[0].interactionRunning !== "" ) {
        continue;
      }
      temp.user_lat = userRes.data[0].lat;
      temp.user_lon = userRes.data[0].lon;

      const fR = await axios.post(
        "http://hihello.asuscomm.com:3000/users/getById",
        { id: temp.friend_id }
      );
      if (fR.data[0].interactionRunning !== "") {
        continue;
      }
      temp.friend_lat = fR.data[0].lat;
      temp.friend_lon = fR.data[0].lon;

      lambdaInfo.push(temp);
    }

    const lambdaRequests = lambdaInfo.map((element) => {
      return new Promise((resolve, reject) => {
        var params = {
          FunctionName: "computeDistances",
          Payload: JSON.stringify({
            user_id: element.user_id,
            friend_id: element.friend_id,
            user_lat: element.user_lat,
            user_lon: element.user_lon,
            friend_lat: element.friend_lat,
            friend_lon: element.friend_lon,
          }),
        };

        lambda.invoke(params, function (err, data) {
          console.log(JSON.parse(data.Payload));
          if (err) {
            reject(err);
          } else {
            if (JSON.parse(data.Payload).valid) {
              axios
                .post("http://hihello.asuscomm.com:3000/interaction/add", {
                  user_one: element.user_id,
                  user_two: element.friend_id,
                })
                .then((res) => {
                  console.log(JSON.stringify(res.data));
                  let yy = JSON.stringify(res.data);
                  axios
                    .post(
                      "http://hihello.asuscomm.com:3000/users/updateInteractionRunning",
                      { id: element.user_id, interactionRunning: yy }
                    )
                    .then((v) => {
                      axios
                        .post(
                          "http://hihello.asuscomm.com:3000/users/updateInteractionRunning",
                          { id: element.friend_id, interactionRunning: yy }
                        )
                        .then((r) => {
                          axios
                            .post(
                              "http://hihello.asuscomm.com:3000/users/getById",
                              { id: element.user_id }
                            )
                            .then((user) => {
                              axios
                                .post(
                                  "http://hihello.asuscomm.com:3000/users/getById",
                                  { id: element.friend_id }
                                )
                                .then((friend) => {
                                  messages.push({
                                    to: user.data[0].notificationId,
                                    sound: "default",
                                    title: "What's that?",
                                    body:
                                      "You have received a quest! " +
                                      friend.data[0].name +
                                      " has been found near you. Go find them and take a picture within five minutes",
                                    data: { interactionData: yy },
                                    channel: "default",
                                  });
                                  messages.push({
                                    to: friend.data[0].notificationId,
                                    sound: "default",
                                    title: "What's that?",
                                    body:
                                      "You have received a quest! " +
                                      user.data[0].name +
                                      " has been found near you. Go find them and take a picture within five minutes",
                                    data: { interactionData: yy },
                                    channel: "default",
                                  });
                                  resolve();
                                })
                                .catch((err) => {
                                  reject(err);
                                });
                            })
                            .catch((err) => {
                              reject(err);
                            });
                        })
                        .catch((err) => {
                          reject(err);
                        });
                    })
                    .catch((err) => {
                      reject(err);
                    });
                })
                .catch((err) => {
                  reject(err);
                });
            } else {
              resolve();
            }
          }
        });
      });
    });

    await Promise.all(lambdaRequests);

    return validMatches;
  } catch (error) {
    console.error("Error:", error);
  }
};

async function main() {
  try {
    let messages = [];

    let x = await getFriendData(messages);

    // messages.push({
    //     to: "ExponentPushToken[VrYYoENI1qNXHfKFZLOLdo]",
    //     sound: null,
    //     title: "Original Title",
    //     body: "And here is the body!"
    // });

    messages.forEach((element) => {
      console.log("test + " + element);
      //   axios.post("https://fcm.googleapis.com/fcm/send", element, config).then((res) => {
      //     console.log(res.data);
      //   }).catch((err) => {
      //     console.log(err);
      //   });
      axios
        .post("https://exp.host/--/api/v2/push/send", element)
        .then((res) => {
          console.log(res.data);
        });
    });

    // Code inside main function will run after all Axios requests have completed

    // let chunks = expo.chunkPushNotifications(messages);
    // let tickets = [];
    // for (let chunk of chunks) {
    //   try {
    //     let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
    //     console.log("Ticket Chunk:", ticketChunk);
    //     tickets.push(...ticketChunk);
    //   } catch (error) {
    //     console.error("Error sending notifications:", error);
    //   }
    // }

    // Check the `tickets` array for any errors or unsuccessful notifications
    // Handle any errors or unsuccessful notifications accordingly
    // For example, you can check the status of each ticket using the 'status' property
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

main();
