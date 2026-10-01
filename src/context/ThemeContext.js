import React, { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

const ThemeContextProvider = (props) => {
	const [sideBarStyle, setSideBarStyle] = useState({ value: "full", label: "Full",});
	const [sidebarposition, setSidebarposition] = useState({ value: "fixed",	label: "Fixed",});
  const [headerposition, setHeaderposition] = useState({ value: "fixed", label: "Fixed", });
  const [sidebarLayout, setSidebarLayout] = useState({ value: "vertical", label: "Vertical",});
  const [primaryColor, setPrimaryColor] = useState("color_1");
  const [sidebarColor, setSidebarColor] = useState("color_1");
  const [iconHover, setIconHover] = useState(false);
  const [sidebariconHover, setSidebariconHover] = useState(false);
  const [menuToggle, setMenuToggle] = useState(false);
  const [background, setBackground] = useState({ value: "light",	label: "Light",});
  const [containerPosition_, setcontainerPosition_] = useState({value: "wide-boxed", label: "Wide Boxed",});
  const body = document.querySelector("body");
  const [windowWidth, setWindowWidth] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);

  
  const changePrimaryColor = (name) => {
	setPrimaryColor(name);
    body.setAttribute("data-primary", name);
  };
  
  const changeSideBarLayout = (name) => {
    if (name.value === "horizontal") {
      if (sideBarStyle.value === "overlay") {
        setSidebarLayout(name);
        body.setAttribute("data-layout", name.value);
        setSideBarStyle({ value: "full", label: "Full" });
        body.setAttribute("data-sidebar-style", "full");
      } else {
        setSidebarLayout(name);
        body.setAttribute("data-layout", name.value);
      }
    } else {
      setSidebarLayout(name);
      body.setAttribute("data-layout", name.value);
    }
  };
  const changeSideBarStyle = (name) => {
    if (sidebarLayout.value === "horizontal") {
      if (name.value === "overlay") {
        alert("Sorry! Overlay is not possible in Horizontal layout.");
      } else {
        setSideBarStyle(name);
        setIconHover(name.value === "icon-hover" ? "_i-hover" : "");
        body.setAttribute("data-sidebar-style", name.value);
      }
    } else {
      setSideBarStyle(name);
      setIconHover(name.value === "icon-hover" ? "_i-hover" : "");
      body.setAttribute("data-sidebar-style", name.value);
    }
  };

  const ChangeIconSidebar = (value) => {
    if(sideBarStyle.value==="icon-hover"){
      if(value){
        setSidebariconHover(true);
      }else{
        setSidebariconHover(false);
      }
    }
  }

  const changeHeaderPostion = (name) => {
    setHeaderposition(name);
    body.setAttribute("data-header-position", name.value);
  };

  const openMenuToggle = () => {
    setMenuToggle(!menuToggle);
  };

  const changeBackground = (name) => {
    body.setAttribute("data-theme-version", name.value);
    setBackground(name);
  };

  const changeContainerPosition = (name) => {
    setcontainerPosition_(name);
    body.setAttribute("data-container", name.value);
    name.value === "boxed" &&
      changeSideBarStyle({ value: "overlay", label: "Overlay" });
  };
  
  
  useEffect(() => {
    if (menuToggle) {
      body.classList.add("menu-toggle");
    } else {
      body.classList.remove("menu-toggle");
    }
  }, [menuToggle, body]);
  
  useEffect(() => {
		let resizeWindow = () => {
			setWindowWidth(window.innerWidth);
			setWindowHeight(window.innerHeight);
			window.innerWidth >= 768 && window.innerWidth < 1024
			? body.setAttribute("data-sidebar-style", "mini")
			: window.innerWidth <= 768
			? body.setAttribute("data-sidebar-style", "overlay")
			: body.setAttribute("data-sidebar-style", "full");
		};
    resizeWindow();
    window.addEventListener("resize", resizeWindow);
    return () => window.removeEventListener("resize", resizeWindow);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        body,       
        sidebarposition,
		    primaryColor,        
		    windowWidth,
		    windowHeight,
        changePrimaryColor,
        changeSideBarStyle,
        sideBarStyle,
        changeHeaderPostion,
        headerposition,
        changeSideBarLayout,
        sidebarLayout,
        changeContainerPosition,        
        sidebarColor,
        iconHover,
        menuToggle,
        openMenuToggle,
        changeBackground,
        ChangeIconSidebar,
        sidebariconHover,
        background,
        containerPosition_,
		    
	}}
    >
      {props.children}
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;


