
var FILENAME = '';

function pass() {}

function onImport() {
    const fileList = document.forms["file-form"]["file-input"].files;
    // console.log(fileList);
    for (let i=0;i<fileList.length;i++) {
        let file = fileList[i];
        if (file) {
            console.log(file);
            FILENAME = file.name;
            var reader = new FileReader();
            reader.readAsText(file, "utf-8");
            reader.onload = function(evt) {
                // let this_result = this.result.replace(/<([^<> ]+)(( [^ <>]+="[^<>\"]+")*) \/>/g, "<$1$2></$1>");
                // // console.log(this_result);
                // // let xml_wrap_node = d3.create('div');
                // // xml_wrap_node.html(this_result);
                // // d3.select("#xml").node().appendChild(xml_wrap_node.node());
                // // d3.select("#xml").html(this_result);
                // document.getElementById('xml').innerHTML=this_result;
                // // the_vue.save_game = xml2data();
                let parser = new DOMParser();
                let xmlObject = parser.parseFromString(this.result, "text/xml");
                the_vue.save_game = node2obj(xmlObject.firstChild);
                d3.select("#xml *").remove();
                d3.select("#xml").node().appendChild(xmlObject.firstChild);
            };
        }
    }
}


function node2obj(node) {
    let dct = {};
    let aa = node.attributes.length;
    if (aa) {
        dct["@attributes"] = {};
        for (let i = 0; i < node.attributes.length; i++) {
            dct["@attributes"][node.attributes[i].nodeName] = node.attributes[i].nodeValue;
        };
    }
    if (node.children.length) {
        for (let nd of node.children) {
            if (dct[nd.tagName]) {
                dct[nd.tagName].push(node2obj(nd));
            } else {
                dct[nd.tagName] = [node2obj(nd)];
            }
        };
        for (let key in dct) {
            if (key[0]!="@"&&dct[key].length==1) {
                dct[key] = dct[key][0];
            }
        }
        return dct;
    } else {
        dct["@text"] = node.textContent;
        if (aa){
            return dct;
        } else {
            return node.textContent;
        }
    }
}

function obj2node(name, obj) {
    var parser = new DOMParser();
    var temp_xml_doc = parser.parseFromString(`<?xml version="1.0" encoding="utf-8"?><SaveGame />`, "text/xml")
    let node = temp_xml_doc.createElement(`${name}`);
    if (typeof(obj)=="string") {
        if (obj.length) {
            let txt = temp_xml_doc.createTextNode(`${obj}`);
            node.appendChild(txt);
        }
        return node;
    } else {
        for (let key in obj) {
            if (key=="@attributes") {
                for (let attrName in obj[key]) {
                    let attr = temp_xml_doc.createAttribute(attrName);
                    attr.value = obj[key][attrName];
                    node.setAttributeNode(attr);
                }
            } else if (key=="@text") {
                if (obj[key].length) {
                    let txt = temp_xml_doc.createTextNode(`${obj[key]}`);
                    node.appendChild(txt);
                }
            } else {
                if (typeof(obj[key])=="string") {
                    let nd_child = obj2node(key, obj[key]);
                    node.appendChild(nd_child);
                } else if (obj[key].length) {
                    for (let obb of obj[key]) {
                        let nd_child = obj2node(key, obb);
                        node.appendChild(nd_child);
                    }
                } else {
                    // console.log(`key: ${key}`);
                    // console.log(obj[key]);
                    let nd_child = obj2node(key, obj[key]);
                    // console.log(`nd_child: ${nd_child}`);
                    node.appendChild(nd_child);
                }
            }
        }
        return node;
    }
}


var the_vue = new Vue({
    el: '#bodywrap',
    data: {
        // player: {
        //     name: "somebody",
        //     is_male: false,
        //     fav_thing: "Stardew Vally",
        //     money: 1000000,
        // },
        // inventory: {
        //     max_num: 36,
        //     items: [],
        // },
        save_game: {},
    },
    computed: {
        save_node: function(){
            return obj2node("SaveGame", this.save_game);
        },
    },
    methods: {
        toggle_btn: function(evt) {
        },
    },
    // created: function() {
    //     console.log("`the_vue` created");
    // },
})





Vue.component('the_data', {
    props: ['Z', 'hit_list_list'],
    template: `
        <div class="thing-item" :class="{hidden:Z.hidden}">
            <p>{{Z.order_id}}</p>
            <!--【{{Z.text}}】-->
            <div v-for="(event, j) in Z.event_list" class="thing-event" :class="{hidden:event.hidden}">
                <p><span class="type" :data-evt_class="event.class" :data-type="event.event_type" :data-evt_id="j" :data-order_id="Z.order_id">{{event.event_type}}</span></p>
                <p v-html="event.evt_html"></p>
            </div>
            <div class="thing-hit" v-if="hit_list_list[Z.order_id][0]">
                <div v-for="(hit, l) in hit_list_list[Z.order_id]">
                    <p :class="hit.corr_class">【{{hit.situation}}：{{hit.type}}】“{{hit.evidence}}”【{{hit.ptn}}】</p>
                </div>
            </div>
        </div>`,
})





