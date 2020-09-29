"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionPage = exports.ExtensionIcon = void 0;
const extensions_1 = require("@lens/extensions");
const react_1 = __importDefault(require("react"));
const path_1 = __importDefault(require("path"));
class ExampleExtension extends extensions_1.LensExtension {
    onActivate() {
        console.log('EXAMPLE EXTENSION: ACTIVATED', this.getMeta());
        this.registerPage({
            type: extensions_1.DynamicPageType.CLUSTER,
            path: "/extension-example",
            menuTitle: "Example Extension",
            components: {
                Page: () => react_1.default.createElement(ExtensionPage, { extension: this }),
                MenuIcon: ExtensionIcon,
            }
        });
    }
    onDeactivate() {
        console.log('EXAMPLE EXTENSION: DEACTIVATED', this.getMeta());
    }
}
exports.default = ExampleExtension;
function ExtensionIcon(props) {
    return react_1.default.createElement(extensions_1.Icon, Object.assign({}, props, { material: "camera", tooltip: path_1.default.basename(__filename) }));
}
exports.ExtensionIcon = ExtensionIcon;
class ExtensionPage extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.deactivate = () => {
            const { extension } = this.props;
            extension.runtime.navigate("/");
            extension.disable();
        };
    }
    render() {
        const { TabLayout } = this.props.extension.runtime.components;
        return (react_1.default.createElement(TabLayout, { className: "ExampleExtension" },
            react_1.default.createElement("div", { className: "flex column gaps align-flex-start" },
                react_1.default.createElement("p", null, "Hello from extensions-api!"),
                react_1.default.createElement("p", null,
                    "File: ",
                    react_1.default.createElement("i", null, __filename)),
                react_1.default.createElement(extensions_1.Button, { accent: true, label: "Deactivate", onClick: this.deactivate }))));
    }
}
exports.ExtensionPage = ExtensionPage;
