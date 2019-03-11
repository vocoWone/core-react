import React from "react";
import {Controller} from "module/intro/home";
import {connect, DispatchProp} from "react-redux";
import {RootState} from "type/state";
import "./index.less";

interface StateProps {
    name: string;
}

interface Props extends StateProps, DispatchProp {}

class Home extends React.PureComponent<Props> {
    pushHistory = (url: string) => this.props.dispatch(Controller.pushHistory(url));

    render() {
        const {name} = this.props;
        return (
            <div className="home-container g-flex-center-column">
                <img src={require("./asset/head.jpeg")} />
                <h1>王志怀·vocoWone {name}</h1>
                <h3>执着于当下，放眼于未来。</h3>
                <nav>
                    <button onClick={() => this.pushHistory("/note/list")}>博客</button>
                    <button onClick={() => this.pushHistory("/demo")}>示例</button>
                    <button onClick={() => this.pushHistory("/about")}>关于</button>
                </nav>
                <nav>
                    <i className="github" onClick={() => window.open("https://github.com/vocoWone")} />
                    <i className="qq" onClick={() => (location.href = "tencent://AddContact/?fromId=50&fromSubId=1&subcmd=all&uin=605131105")} />
                    <i className="mail" onClick={() => (location.href = "mailto:hezhou920@gmail.com")} />
                    <i className="resume" onClick={() => (location.href = "https://github.com/vocoWone")} />
                </nav>
                {/* <p>1994年03月25日出生的白羊boy，祖籍福建古田。性格属乐天派但缺乏成熟。2017年7月毕业于集美大学诚毅学院。痴迷前端、贪于学习、热爱运动的萌新攻城狮，希望有一天能成为全栈工程师。梦想有一天：面朝大海，春暖花开。</p> */}
            </div>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    return {
        name: state.app.home.name,
    };
};

export default connect(mapStateToProps)(Home);
