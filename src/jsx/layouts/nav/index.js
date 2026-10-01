import React, { Fragment, useState } from "react";
import SideBar from "./SideBar";
import NavHader from "./NavHader";
import Header from "./Header";
import ChatBox from "../ChatBox";

const JobieNav = ({ title, onClick: ClickToAddEvent, onClick2, onClick3 }) => {
  const [toggle, setToggle] = useState("");
  const onClick = (name) => setToggle(toggle === name ? "" : name);
  const authStatus = localStorage.getItem("isAuthenticated");
  const role = localStorage.getItem("userRole");
  const canSeeSidebar = authStatus === "true" && ["admin", "superadmin","1","2"].includes(role);

  return (
    <Fragment>
      <NavHader />
      <ChatBox onClick={() => onClick("chatbox")} toggle={toggle} />
        {canSeeSidebar &&  <Header
        onNote={() => onClick("chatbox")}
        onNotification={() => onClick("notification")}
        onProfile={() => onClick("profile")}
        toggle={toggle}
        title={title}
        onBox={() => onClick("box")}
        onClick={() => ClickToAddEvent()}
      />}
     
      {canSeeSidebar && <SideBar />}
    </Fragment>
  );
};

export default JobieNav;
