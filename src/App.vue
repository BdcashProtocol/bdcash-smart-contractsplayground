<template>
  <div id="app">
    <div v-if="!isLogging && wallet">
      <b-navbar>
        <template slot="brand">
          <b-navbar-item tag="router-link" :to="{ path: '/' }">
            <img src="/logo.png" style="margin-right:20px" /> Smart Contracts Playground
          </b-navbar-item>
        </template>
        
        <!-- UNCOMMENT FOR MENU
        <template slot="start">
          <b-navbar-item href="/#/">Home</b-navbar-item>
        </template> -->

        <template slot="end">
          <b-navbar-item tag="div">
            <div class="buttons">
              <v-gravatar class="gravatar" :email="address" style="margin-right: 10px; height: 80px;max-height: 37px;float: right;margin-top: -8px;border-radius: 4px;"/>
              <a v-on:click="logout" class="logout button is-primary">
                <strong>Logout</strong>
              </a>
            </div>
          </b-navbar-item>
        </template>
      </b-navbar>
      <router-view />
    </div>

    <div v-if="!wallet">
      <section class="hero">
        <div class="hero-body" style="padding: 0;">
          <div class="container" id="create" style="margin-top:50px;">
            <div class="card">
              <div style="padding: 50px 20px;">
                <h1 class="title is-1">Start Now</h1>
                <br />
                <h2 class="subtitle">
                  <br />You need a BDcash Identity to enter the platform.
                  <br />
                  <br />Use <a href="https://bdcashprotocol.com/download/" target="_blank">BDCash Wallet Extension</a> or <a v-on:click="showCreate">create a new wallet</a>.
                  <br />
                  <br />
                  <div id="scrypta-login" gateway="0240f294ef20c7bbb82bae24d8d22c7ab94d195adf153162482b6bf540393d7dd5" dapp="Smart Contracts Playground"></div>
                </h2>
              </div>
            </div>
            <br />BDCash Smart Contracts Playground
            <a
              href="https://github.com/BdcashProtocol/bdcash-smart-contracts-playground"
              target="_blank"
            >open-source</a> project by
            <a href="https://bdcashprotocol.com" target="_blank">BDCash Protocol</a>.
            <br />
            <br />
          </div>
        </div>
      </section>
    </div>

    <b-loading :is-full-page="true" :active.sync="isLogging" :can-cancel="false"></b-loading>
    <b-modal :active.sync="showCreateModal" has-modal-card trap-focus aria-role="dialog" aria-modal>
      <form action>
        <div class="modal-card" style="width: auto">
          <header class="modal-card-head">
            <p class="modal-card-title">Create new Identity</p>
          </header>
          <section class="modal-card-body">
            <b-field label="Insert Password">
              <b-input
                type="password"
                v-model="password"
                password-reveal
                placeholder="Your main password"
                required
              ></b-input>
            </b-field>

            <b-field v-if="!wallet" label="Repeat password">
              <b-input
                type="password"
                v-model="passwordrepeat"
                password-reveal
                placeholder="Repeat password"
                required
              ></b-input>
            </b-field>
          </section>
          <footer v-if="!isCreating && !isUpdating" class="modal-card-foot">
            <button
              v-if="!wallet"
              class="button is-primary"
              style="width:100%"
              v-on:click="createUser"
            >CREATE</button>
          </footer>
          <footer v-if="isCreating" class="modal-card-foot">
            <div style="text-align:center">Creating identity, please wait...</div>
          </footer>
        </div>
      </form>
    </b-modal>
  </div>
</template>

<script>
  let ScryptaCore = require("@bdcash-protocol/core");

  export default {
    data() {
      return {
        scrypta: new BdcashCore(true),
        address: "",
        wallet: "",
        isLogging: true,
        file: [],
        isCreating: false,
        backup: false,
        isUpdating: false,
        showCreateModal: false,
        password: "",
        passwordrepeat: ""
      };
    },
    async mounted() {
      const app = this;
      app.wallet = await app.scrypta.importBrowserSID();
      app.wallet = await app.scrypta.returnDefaultIdentity();
      if (app.wallet.length > 0) {
        let SIDS = app.wallet.split(":");
        app.address = SIDS[0];
        let identity = await app.scrypta.returnIdentity(app.address);
        app.wallet = identity;
        app.isLogging = false;
      } else {
        app.isLogging = false;
      }
    },
    methods: {
      loadWalletFromFile() {
        const app = this;
        const file = app.file;
        const reader = new FileReader();
        reader.onload = function() {
          var dataKey = reader.result;

          app.$buefy.dialog.prompt({
            message: `Enter wallet password`,
            inputAttrs: {
              type: "password"
            },
            trapFocus: true,
            onConfirm: async password => {
              let key = await app.scrypta.readKey(password, dataKey);
              if (key !== false) {
                app.scrypta.importPrivateKey(key.prv, password);
                localStorage.setItem("SID", dataKey)
                let exp = dataKey.split(':')
                localStorage.setItem("sid_backup", exp[0])
                location.reload();
              } else {
                app.$buefy.toast.open({
                  message: "Wrong password!",
                  type: "is-danger"
                });
              }
            }
          });
        };
        reader.readAsText(file);
      },
      showCreate() {
        const app = this;
        app.showCreateModal = true;
      },
      logout() {
        localStorage.setItem("SID", "");
        location.reload();
      },
      async createUser() {
        const app = this;
        if (app.password !== "") {
          if (app.passwordrepeat === app.password) {
            app.isCreating = true;
            setTimeout(async function() {
              let id = await app.scrypta.createAddress(app.password, true);
              let identity = await app.scrypta.returnIdentity(id.pub);
              app.address = id.pub;
              app.wallet = identity;
              localStorage.setItem("SID", id.walletstore);
              app.showCreateModal = false;
              app.password = "";
              app.passwordrepeat = "";
              let tx = await app.scrypta.post("/init", {
                address: id.pub,
                airdrop: true
              });
              if (tx.airdrop_tx === false) {
                app.$buefy.toast.open({
                  message: "Sorry, airdrop was not successful!",
                  type: "is-danger"
                });
              }
              app.isCreating = false;
            }, 500);
          } else {
            app.$buefy.toast.open({
              message: "Passwords doesn't matches.",
              type: "is-danger"
            });
          }
        } else {
          app.$buefy.toast.open({
            message: "Write a password first!",
            type: "is-danger"
          });
        }
      },
      downloadBackup(){
        const app = this
        app.$buefy.dialog.prompt({
          message: `Enter wallet password`,
          inputAttrs: {
            type: "password"
          },
          trapFocus: true,
          onConfirm: async password => {
            let SID = localStorage.getItem('SID')
            let key = await app.scrypta.readKey(password, SID);
            if (key !== false) {
              var a = document.getElementById("downloadid");
              app.backup = true
              localStorage.setItem('sid_backup', app.address)
              var file = new Blob(
                [SID],
                { type: "sid" }
              );
              a.href = URL.createObjectURL(file);
              a.download = app.address + ".sid";
              var clickEvent = new MouseEvent("click", {
                view: window,
                bubbles: true,
                cancelable: false
              });
              a.dispatchEvent(clickEvent);
            }else{
              app.$buefy.toast.open({
                message: "Wrong password!",
                type: "is-danger"
              });
            }
          }
        })
      }
    }
  };
</script>

<style>
  #app {
    font-family: "Sen";
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }

  #nav {
    padding: 30px;
  }

  #nav a {
    font-weight: bold;
    color: #2c3e50;
  }

  #nav a.router-link-exact-active {
    color: #42b983;
  }
</style>
