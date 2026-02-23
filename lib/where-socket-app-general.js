const app = async (config, where) => {

  const {common, da} = where;

  const credential = await config.requestStaticCredential().catch(err => {
    return null;
  });

  // on
  const connect = async (socket, clients) => {

    const {socket: s, ...sender} = socket;

    const {broadcast = false, notification = false, loopback = false} = credential ||
        await config.requestCredential(sender.group);

    const defaultTo = (broadcast) ? {app: sender.app} : {group: sender.group};

    const on = {

      open: async () => {

        const date = common.util.date.string(new Date());

        const message = {user: 'join', sender, date};
        ;;; where.log(message);

        if (!notification) {
          return;
        }

        da.filter(clients, {where: {...defaultTo, 'id!': sender.id}}).map((v, i) => {
          v.socket.send([message]);
        });

      },

      message: async (data, condition) => {

        const date = common.util.date.string(new Date()),
              send = data.map((notification) ? v => ({...v, sender, date}) : v => ({...v, date}));

        ;;; where.log({message: 'receive', sender});

        const {app = {}, ...rest} = condition.where || {},
              w = (condition.where) ? {...rest, ...defaultTo} : defaultTo;

        const id = (loopback) ? {} : {'id!': sender.id};

        try {

          da.filter(clients, {where: {...w, ...id}}).map((v, i) => {
            v.socket.send(send);
          });

        } catch(err) {
          console.log(err);
          ;;; where.log({error: err.message});
        }

      },

      close: async (code, desc) => {

        const date = common.util.date.string(new Date());

        const message = {user: 'leave', sender, date};
        ;;; where.log(message);

        if (!notification) {
          return;
        }

        da.filter(clients, {where: {...defaultTo, 'id!': sender.id}}).map((v, i) => {
          v.socket.send([message]);
        });
      }

    };

    return on;

  };

  // end
  const end = async () => {
  };

  // app
  const app = {connect, end};

  return app;

};

export { app };
