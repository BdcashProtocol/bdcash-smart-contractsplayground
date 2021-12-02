<template>
  <div class="home">
    <b-loading
      :is-full-page="true"
      :active.sync="isLogging"
      :can-cancel="false"
    ></b-loading>
    <div class="sidebar">
      <b-tabs
        class="tabs-custom"
        type="is-toggle"
        :animated="false"
        v-model="activeTab"
        vertical
        expanded
      >
        <b-tab-item label="" icon="play">
          <div
            style="float: right; cursor: pointer"
            v-on:click="createLocalContract"
          >
            <b-icon icon="plus" size="is-small"> </b-icon>
          </div>
          <div v-if="local.length > 0">
            <b> LOCAL CONTRACTS </b>
            <div
              v-for="contract in local"
              style="font-size: 13px; width: 100%; display: block"
              v-bind:key="contract"
            >
              <span
                style="cursor: pointer"
                v-bind:class="{ active: lastContract === contract }"
                v-on:click="selectContract(contract)"
                >{{ contract }}</span
              >
              <div
                style="float: right; cursor: pointer"
                v-on:click="deleteContract(contract)"
              >
                <b-icon icon="delete" size="is-small"> </b-icon>
              </div>
            </div>
            <hr style="margin: 10px 0; padding: 0" />
          </div>
          <b
            style="
              width: 100%;
              text-align: center;
              display: block;
              margin-bottom: 4px;
            "
            >TEST CONTRACT FUNCTIONS</b
          >
          <div v-if="contract.functions" style="text-align: center">
            <div v-for="fn in contract.functions" v-bind:key="fn">
              <b-button
                v-if="selected !== fn"
                size="is-small"
                expanded
                style="text-align: left"
                v-on:click="selectfunction(fn)"
              >
                {{ fn }}
              </b-button>
              <b-button
                v-if="selected === fn"
                size="is-small"
                expanded
                type="is-danger"
                style="text-align: left"
              >
                {{ fn }}
              </b-button>
            </div>
          </div>
          <div style="position: relative">
            <b-input
              v-if="selected === 'eachBlock' || selected === 'ifMempool'"
              placeholder="Insert block to inject"
              v-model="block"
            ></b-input>
            <b-tooltip
              v-if="selected === 'eachBlock' || selected === 'ifMempool'"
              label="Inject last block"
              style="
                cursor: pointer;
                position: absolute;
                top: 7px;
                z-index: 99;
                right: 7px;
              "
              position="is-left"
            >
              <div v-on:click="getLastBlock">
                <b-icon icon="download-network"></b-icon>
              </div>
            </b-tooltip>
          </div>
          <b-input
            v-if="selected !== 'eachBlock' && selected !== 'ifMempool'"
            placeholder="Insert parameters"
            v-model="params"
            type="textarea"
          ></b-input>
          <br />
          <b-button size="is-medium" v-on:click="run" expanded type="is-primary"
            >RUN</b-button
          >
          <div
            style="
              padding-left: 45px;
              position: relative;
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
            "
          >
            <b-button
              size="is-medium"
              type="is-success"
              style="border-radius: 0px"
              v-on:click="deploy"
              v-if="!isDeploying"
              expanded
              >DEPLOY</b-button
            >
          </div>
        </b-tab-item>

        <b-tab-item label="" icon="view-dashboard">
          <h1>Your contracts</h1>
          <i
            >This section shows your deployed contracts, click on it to start
            edit in local editor or click play button to run it in mainnet.</i
          >
          <hr />
          <div v-if="remote.length === 0">No deployed contracts..</div>
          <div v-if="remote.length > 0">
            <div
              v-for="contract in remote"
              style="font-size: 13px; width: 100%; display: block"
              v-bind:key="contract.name"
            >
              <span
                style="cursor: pointer"
                v-bind:class="{ active: remoteContractName === contract.name }"
                v-on:click="copyContract(contract)"
              >
                {{ contract.name }}<br />
                <b>Current version:</b> <span style="font-size:9px">{{ contract.version }}</span><br />
                <b>Address:</b> <span style="font-size:9px">{{ contract.address }}</span>
              </span>
              <div
                style="float: right; cursor: pointer"
                v-on:click="playContract(contract)"
              >
                <b-icon icon="play" size="is-small"> </b-icon>
              </div>
              <hr style="margin: 5px 0; padding: 0" />
            </div>
          </div>
        </b-tab-item>

        <b-tab-item label="" icon="compass">
          <h1>Discovery contracts</h1>
          <div v-if="!lastRemote">
            <i
              >In this section you'll be able to send and run contracts
              functions of deployed contracts. Click in the name to copy it in
              local enviorment or click play button to start interactions.</i
            >
            <hr />
          </div>
          <div v-if="allcontracts.length > 0">
            <div
              v-for="contract in allcontracts"
              style="font-size: 13px; width: 100%; display: block"
              v-bind:key="contract.name"
            >
              <span
                style="cursor: pointer"
                v-bind:class="{ active: remoteContractName === contract.name }"
                v-on:click="copyContract(contract)"
              >
                {{ contract.name }}
              </span>
              <div
                style="float: right; cursor: pointer"
                v-on:click="playContract(contract)"
              >
                <b-icon icon="play" size="is-small"> </b-icon>
              </div>
            </div>
            <hr style="margin: 5px 0; padding: 0" />
          </div>
          <div v-if="lastRemote !== ''">
            <h1 style="font-size: 14px !important">
              {{ lastRemote.name }}
              <span style="font-size: 12px">v.{{ lastRemote.version }}</span>
            </h1>
            <b style="font-size: 12px">Deployed at</b>
            &nbsp;<span style="font-size: 10px">{{ lastRemote.address }}</span
            ><br />
            <i style="font-size: 13px">{{ lastRemote.description }}</i>
            <hr />
            <b
              style="
                width: 100%;
                text-align: center;
                display: block;
                margin-bottom: 4px;
              "
              >RUN CONTRACT FUNCTIONS</b
            >
            <div v-if="lastRemote.functions" style="text-align: center">
              <div v-for="fn in lastRemote.functions" v-bind:key="fn">
                <b-button
                  v-if="
                    selected !== fn && fn !== 'eachBlock' && fn !== 'ifMempool'
                  "
                  size="is-small"
                  expanded
                  style="text-align: left"
                  v-on:click="selectfunction(fn)"
                >
                  {{ fn }}
                </b-button>
                <b-button
                  v-if="
                    selected === fn && fn !== 'eachBlock' && fn !== 'ifMempool'
                  "
                  size="is-small"
                  expanded
                  type="is-danger"
                  style="text-align: left"
                >
                  {{ fn }}
                </b-button>
              </div>
            </div>
            <b-input
              placeholder="Insert parameters"
              v-model="params"
              type="textarea"
            ></b-input>
            <br />
            <b-button
              size="is-medium"
              v-on:click="runremote"
              expanded
              type="is-primary"
              >RUN</b-button
            >
          </div>
        </b-tab-item>
      </b-tabs>
    </div>
    <prism-editor
      v-bind:class="{ 'editor-debug': showdebug }"
      class="contract-editor"
      v-model="code"
      :highlight="highlighter"
      line-numbers
    ></prism-editor>
    <div
      v-if="showdebug"
      v-bind:class="{ fulldebug: fullDebug }"
      class="debugger"
      id="debugger"
    >
      <div class="debug" v-html="debug"></div>
    </div>
  </div>
</template>

<script>
import { PrismEditor } from "vue-prism-editor";
import "vue-prism-editor/dist/prismeditor.min.css";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";
const hello_world = require("../hello_world.js");
const ScryptaCore = require("@bdcash-protocol/core");
const ScryptaCompiler = require("@bdcash-protocol/compiler");
var CoinKey = require("coinkey");
const axios = require("axios");
const LZUTF8 = require("lzutf8");

export default {
  components: {
    PrismEditor,
  },
  data: () => ({
    code: hello_world.code,
    identity: {},
    scrypta: new ScryptaCore(true),
    v001: ScryptaCompiler.v001,
    coinkey: CoinKey,
    remote: [],
    contract: {},
    showSave: false,
    fullDebug: false,
    selected: "eachBlock",
    lastContract: "HELLOWORLD",
    isLogging: true,
    allcontracts: [],
    lastRemote: "",
    params: "",
    activeTab: 0,
    block: "",
    showdebug: true,
    remoteContractName: "",
    isDeploying: false,
    local: [],
    session: {},
    debug: "> Playground ready, please run a function first.",
  }),
  async mounted() {
    const app = this;
    app.wallet = await app.scrypta.importBrowserSID();
    app.wallet = await app.scrypta.returnDefaultIdentity();
    let address = await app.scrypta.createAddress("SESSION");
    app.scrypta.staticnodes = true;
    app.session = address;
    if (localStorage.getItem("contracts") !== null) {
      let stored = JSON.parse(localStorage.getItem("contracts"));
      if (Object.keys(stored).length > 0) {
        let contracts = Object.keys(stored);
        app.local = contracts;
        app.lastContract = app.local[0];
        app.code = Buffer.from(stored[app.local[0]], "hex").toString("utf-8");
      }
    }
    if (app.wallet.length > 0) {
      let SIDS = app.wallet.split(":");
      app.address = SIDS[0];
      let identity = await app.scrypta.returnIdentity(app.address);
      app.wallet = identity;
      let remote = await app.scrypta.post("/read", {
        protocol: "ida://",
      });
      let unique = [];
      let uniqueowner = [];
      for (let k in remote.data) {
        try {
          if (remote.data[k].data.message !== undefined) {
            let contract = JSON.parse(remote.data[k].data.message);
            contract.address === remote.data[k].address;
            contract.developer === remote.data[k].data.address;
            if (
              remote.data[k].data.address === app.address &&
              uniqueowner.indexOf(remote.data[k].address) === -1
            ) {
              uniqueowner.push(remote.data[k].address);
              app.remote.push(contract);
            }
            if (unique.indexOf(remote.data[k].address) === -1) {
              unique.push(remote.data[k].address);
              app.allcontracts.push(contract);
            }
          }
        } catch (e) {
          app.log(remote.data[k].data);
        }
      }
      app.isLogging = false;
    } else {
      app.isLogging = false;
    }
    app.contract = await app.v001.compiler(app.code);
    delete app.contract.code;
    await app.save();
  },
  methods: {
    async copyContract(contract) {
      const app = this;
      app.lastContract = contract.name;
      app.log(
        'CONTRACT "' + app.lastContract + '" COPIED IN PLAYGROUND ENVIORMENT'
      );
      app.code = LZUTF8.decompress(contract.code, { inputEncoding: "Base64" });
      app.contract = await app.v001.compiler(app.code);
      delete app.contract.code;
      app.activeTab = 0;
    },
    async playContract(contract) {
      const app = this;
      app.remoteContractName = contract.name;
      app.log(
        'CONTRACT "' + app.remoteContractName + '" SELECTED FOR RUN IN MAINNET'
      );
      let code = LZUTF8.decompress(contract.code, { inputEncoding: "Base64" });
      app.lastRemote = await app.v001.compiler(code);
      app.lastRemote.address = contract.address;
      app.activeTab = 2;
      app.fullDebug = true;
    },
    runremote() {
      const app = this;
      app.$buefy.dialog.prompt({
        message: `Inserisci la password del wallet`,
        inputAttrs: {
          type: "password",
        },
        trapFocus: true,
        onConfirm: async (password) => {
          let key = await app.scrypta.readKey(password, app.wallet.wallet);
          if (key !== false) {
            let searchsigned = await app.scrypta.createContractRequest(
              app.wallet.wallet,
              password,
              {
                contract: "LgSAtP3gPURByanZSM32kfEu9C1uyQ6Kfg",
                function: "index",
                params: {
                  contract: app.lastRemote.address,
                  version: "latest",
                },
              }
            );
            app.log(
              "SEARCH WHERE CONTRACT " + app.lastRemote.address + " IS STORED"
            );
            try {
              let maintainers = await app.scrypta.post(
                "/contracts/run",
                searchsigned
              );
              if (maintainers !== undefined && maintainers !== false) {
                if (maintainers.length > 0) {
                  let params;
                  try {
                    params = JSON.parse(app.params);
                  } catch (e) {
                    params = app.params;
                  }
                  let requestsigned = await app.scrypta.createContractRequest(
                    app.wallet.wallet,
                    password,
                    {
                      contract: app.lastRemote.address,
                      function: app.selected,
                      params: params,
                      version: "latest",
                    }
                  );
                  let answered = false;
                  let aix = 0;
                  app.log("FOUND " + maintainers.length + " MAINTAINERS");
                  while (answered === false) {
                    let idanode = maintainers[0];
                    app.log("ASKING " + idanode.url + " TO RESPONSE");
                    let response = await app.scrypta.post(
                      "/contracts/run",
                      requestsigned,
                      idanode.url
                    );
                    if (response !== undefined) {
                      try {
                        app.log(JSON.stringify(response));
                      } catch (e) {
                        app.log(response);
                      }
                      answered = true;
                    }
                    aix++;
                    if (aix > 9) {
                      answered = true;
                      app.log("CAN'T GET RESPONSE FROM MAINTAINERS");
                    }
                  }
                } else {
                  app.log("NO ONE MAINTAIN CONTRACT " + app.lastRemote.address);
                }
              } else {
                app.log("INDEXER CONTRACT NOT WORKING");
              }
            } catch (e) {
              app.log("ERROR WHILE SEARCHING INDEXED CONTRACT");
              app.log(e);
            }
          } else {
            app.log("WRONG PASSWORD!");
          }
        },
      });
    },
    deploy() {
      const app = this;
      if (app.isDeploying === false) {
        app.isDeploying = true;
        app.$buefy.dialog.prompt({
          message: `Inserisci la password del wallet`,
          inputAttrs: {
            type: "password",
          },
          trapFocus: true,
          onConfirm: async (password) => {
            let key = await app.scrypta.readKey(password, app.wallet.wallet);
            if (key !== false) {
              let pubkey = await app.scrypta.getPublicKey(key.prv);
              let address = await app.scrypta.getAddressFromPubKey(pubkey);
              app.log("AUTHOR ADDRESS IS: " + address);
              let balance = await app.scrypta.get("/balance/" + address);
              const hash = await app.scrypta.hash(
                key.prv + ":" + app.contract.name
              );
              let contract = new CoinKey(Buffer.from(hash, "hex"), {
                private: 0xae,
                public: 0x30,
                scripthash: 0x0d,
              });
              app.log("CONTRACT ADDRESS IS: " + contract.publicAddress);
              app.contract.v = 1;
              app.contract.address = contract.publicAddress;
              let manifest = app.contract;
              manifest.code = LZUTF8.compress(app.code, {
                outputEncoding: "Base64",
              });
              let sid = await app.scrypta.buildWallet(
                "TEMPORARY",
                contract.publicAddress,
                {
                  prv: contract.privateWif,
                  key: contract.publicKey.toString("hex"),
                },
                false
              );
              if (balance.balance > 0.011) {
                let genesis_check = await app.scrypta.post("/read", {
                  address: manifest.address,
                  refID: "genesis",
                  protocol: "ida://",
                });
                if (genesis_check.data[0] !== undefined) {
                  let genesis = genesis_check.data[0].data;
                  genesis.contract = JSON.parse(genesis.message);
                  if (
                    genesis.contract.name === manifest.name &&
                    genesis.contract.address === manifest.address
                  ) {
                    app.log("GENESIS EXIST, CHECK IF EXIST VERSION.");
                    let version_check = await app.scrypta.post("/read", {
                      address: manifest.address,
                      refID: manifest.version,
                      protocol: "ida://",
                    });
                    if (
                      version_check.data[0] === undefined &&
                      genesis.contract.version !== manifest.version
                    ) {
                      app.log("PUBLISHING UPDATE " + manifest.version);
                      if (
                        genesis.contract.immutable === undefined ||
                        genesis.contract.immutable === "false"
                      ) {
                        let signed = await app.scrypta.signMessage(
                          key.prv,
                          JSON.stringify(manifest)
                        );
                        let contractBalance = await app.scrypta.get(
                          "/balance/" + manifest.address
                        );
                        let funded = false;
                        if (contractBalance.balance < 0.002) {
                          funded = await app.fundAddress(
                            manifest.address,
                            key.prv
                          );
                        } else {
                          funded = true;
                        }
                        if (funded !== false) {
                          let update_written = await app.scrypta.write(
                            sid,
                            "TEMPORARY",
                            JSON.stringify(signed),
                            "",
                            manifest.version,
                            "ida://"
                          );
                          if (
                            update_written.uuid !== undefined &&
                            update_written.txs !== undefined &&
                            update_written.txs.length > 0
                          ) {
                            app.log("UPDATE TRANSACTION WRITTEN CORRECTLY");
                            app.isDeploying = false;
                          } else {
                            app.isDeploying = false;
                            app.error("ERROR WHILE CREATING TRANSACTION");
                          }
                        } else {
                          app.isDeploying = false;
                          app.log("ERROR WHILE FUNDING ADDRESS");
                        }
                      } else {
                        app.isDeploying = false;
                        app.log("CAN'T UPDATE IMMUTABLE CONTRACT!");
                      }
                    } else {
                      app.isDeploying = false;
                      app.log("VERSION EXIST, PLEASE UPDATE CONTRACT FIRST");
                    }
                  } else {
                    app.isDeploying = false;
                    app.log("GENESIS TRANSACTION DOESN'T MATCH.");
                  }
                } else {
                  app.log("SIGNING GENESIS TRANSACTION.");
                  let signed = await app.scrypta.signMessage(
                    key.prv,
                    JSON.stringify(manifest)
                  );
                  let contractBalance = await app.scrypta.get(
                    "/balance/" + manifest.address
                  );
                  let funded = false;
                  if (contractBalance.balance < 0.01) {
                    funded = await app.fundAddress(manifest.address, key.prv);
                  } else {
                    funded = true;
                  }
                  if (funded !== false) {
                    let genesis_written = await app.scrypta.write(
                      sid,
                      "TEMPORARY",
                      JSON.stringify(signed),
                      "",
                      "genesis",
                      "ida://"
                    );
                    if (
                      genesis_written.uuid !== undefined &&
                      genesis_written.txs !== undefined &&
                      genesis_written.txs.length > 0
                    ) {
                      app.isDeploying = false;
                      app.log("GENESIS TRANSACTION WRITTEN CORRECTLY");
                    } else {
                      app.isDeploying = false;
                      app.error("ERROR WHILE CREATING TRANSACTION");
                    }
                  } else {
                    app.isDeploying = false;
                    app.log("ERROR WHILE FUNDING ADDRESS");
                  }
                }
              } else {
                app.isDeploying = false;
                app.log("NOT ENOUGH BALANCE");
              }
            } else {
              app.isDeploying = false;
              app.log("WRONG PASSWORD!");
            }
          },
        });
      }
    },
    async fundAddress(contractAddress, privkey) {
      const app = this;
      return new Promise(async (response) => {
        let funded = false;
        let success = false;
        let retries = 0;
        while (funded === false) {
          let pubkey = await app.scrypta.getPublicKey(privkey);
          let address = await app.scrypta.getAddressFromPubKey(pubkey);
          let sid = await app.scrypta.buildWallet(
            "TEMPORARY",
            address,
            { prv: privkey, key: pubkey },
            false
          );
          let sent = await app.scrypta.send(
            sid,
            "TEMPORARY",
            contractAddress,
            0.01
          );
          if (sent !== false && sent !== null && sent.length === 64) {
            funded = true;
            success = true;
          }
          retries++;
          if (retries > 10) {
            funded = true;
          }
        }
        if (funded === true && success === true) {
          setTimeout(function () {
            response(true);
          }, 1000);
        } else {
          response(false);
        }
      });
    },
    async getLastBlock() {
      const app = this;
      let info = await app.scrypta.get("/wallet/getinfo");
      app.block = info.blocks;
    },
    highlighter(code) {
      return highlight(code, languages.js);
    },
    async selectContract(contract) {
      const app = this;
      let stored = JSON.parse(localStorage.getItem("contracts"));
      app.lastContract = contract;
      app.code = Buffer.from(stored[app.lastContract], "hex").toString("utf-8");
      app.contract = await app.v001.compiler(app.code);
      delete app.contract.code;
      setTimeout(function () {
        app.showSave = false;
      }, 10);
    },
    createLocalContract() {
      const app = this;
      if (localStorage.getItem("contracts") === null) {
        localStorage.setItem("contracts", JSON.stringify({}));
      }
      let stored = JSON.parse(localStorage.getItem("contracts"));
      let contractName = "NEW CONTRACT";
      stored[contractName] =
        "2f2a2a0a20202a204e414d453a204e455720434f4e54524143540a20202a204445534352495054494f4e3a204120434f4e54524143540a20202a20415554484f523a20594f555220464142554c4f5553204e414d450a20202a2056455253494f4e3a20312e302e300a20202a20494d4d555441424c453a2066616c73650a20202a2f0a0a2f2f20444546494e494e4720434f4d50494c45522056455253494f4e0a2f2a20536372797074612076302e302e31202a2f0a0a6173796e632066756e6374696f6e20636f6e7374727563746f722829207b0a0a7d0a66756e6374696f6e207075626c69633a2065616368426c6f636b28626c6f636b297b0a20200a7d0a66756e6374696f6e207075626c69633a2069664d656d706f6f6c28626c6f636b297b0a20200a7d";
      localStorage.setItem("contracts", JSON.stringify(stored));
      app.selectContract("NEW CONTRACT");
      let contracts = Object.keys(stored);
      app.local = contracts;
    },
    deleteContract(contract) {
      const app = this;
      return new Promise((response) => {
        if (app.contract.name !== undefined) {
          let stored = JSON.parse(localStorage.getItem("contracts"));
          delete stored[contract];
          localStorage.setItem("contracts", JSON.stringify(stored));
          stored = JSON.parse(localStorage.getItem("contracts"));
          let contracts = Object.keys(stored);
          app.local = contracts;
          response(true);
        }
      });
    },
    save() {
      const app = this;
      return new Promise((response) => {
        if (app.contract.name !== undefined) {
          let codehex = Buffer.from(app.code).toString("hex");
          if (localStorage.getItem("contracts") === null) {
            localStorage.setItem("contracts", JSON.stringify({}));
          }
          let stored = JSON.parse(localStorage.getItem("contracts"));
          stored[app.contract.name] = codehex;
          localStorage.setItem("contracts", JSON.stringify(stored));
          stored = JSON.parse(localStorage.getItem("contracts"));
          let contracts = Object.keys(stored);
          app.local = contracts;
          response(true);
        }
      });
    },
    selectfunction(what) {
      const app = this;
      app.params = "";
      app.selected = what;
    },
    async run() {
      const app = this;
      try {
        let codehex = Buffer.from(app.code).toString("hex");
        if (
          (app.selected === "eachBlock" || app.selected === "ifMempool") &&
          app.block !== undefined &&
          parseInt(app.block) > 0
        ) {
          let block = await app.scrypta.get("/analyze/" + app.block);
          app.params = block.data;
        }
        let params;
        try {
          params = JSON.parse(app.params);
        } catch (e) {
          params = app.params;
        }
        let requesthex = Buffer.from(
          JSON.stringify({ function: app.selected, params: params })
        ).toString("hex");
        let request = await app.scrypta.signMessage(
          app.session.prv,
          requesthex
        );

        let result = await axios.post("https://engine.scryptachain.org/run", {
          address: "code:" + codehex,
          request: request,
        });

        app.log(JSON.stringify(result.data));
      } catch (e) {
        app.log(e);
      }
    },
    log(what) {
      this.debug += `<br>> ` + what;
      var objDiv = document.getElementById("debugger");
      setTimeout(function () {
        objDiv.scrollTop = 9999999999999999999999;
      }, 1);
    },
  },
  watch: {
    code: async function (newCode, oldCode) {
      const app = this;
      if (newCode !== oldCode) {
        let oldContract = await app.v001.compiler(oldCode);
        app.contract = await this.v001.compiler(newCode);
        delete this.contract.code;
        if (
          oldContract.name !== app.contract.name &&
          app.lastContract === oldContract.name
        ) {
          await this.deleteContract(oldContract.name);
          app.lastContract = app.contract.name;
        }
        app.save();
      }
    },
    activeTab: function (selected) {
      const app = this;
      app.params = "";
      app.selected = "";
      if (selected === 2) {
        this.fullDebug = true;
      } else {
        this.fullDebug = false;
      }
    },
  },
};
</script>

<style>
body,
html {
  overflow: hidden;
}
.debugger {
  position: fixed;
  width: 75%;
  height: 25vh;
  background: #000;
  color: #00ff00;
  bottom: 0;
  right: 0;
  text-align: left;
  overflow-y: scroll;
}
.fulldebug {
  height: calc(100vh - 55px) !important;
}
.debugger .debug {
  font-size: 12px;
  padding: 10px 10px 30px 10px;
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  word-break: break-word;
}
.contract-editor {
  width: 75%;
  float: left;
  background: #2d2d2d;
  color: #ccc;
  height: calc(100vh - 55px);
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
}
.editor-debug {
  height: calc(75vh - 55px);
}
.icon {
  margin-right: 0px !important;
}
.tabs a {
  padding: 0 10px !important;
  border-radius: 0 !important;
}
.sidebar {
  float: left;
  width: 25%;
  background: #efefef;
  height: calc(100vh - 55px);
  text-align: left;
}

.tabs-custom {
  height: calc(100vh - 55px);
}
.tab-content {
  padding-left: 60px !important;
  word-break: break-word;
}
.active {
  font-weight: bold !important;
}
.tabs {
  height: calc(100vh - 55px);
  position: fixed;
  top: 55px;
  z-index: 19;
  left: 0;
}
/* optional class for removing the outline */
.prism-editor__textarea:focus {
  outline: none;
}
</style>