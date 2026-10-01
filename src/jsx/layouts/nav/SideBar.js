import React, { useContext,  useEffect,  useMemo,  useReducer, useState } from "react";
import { Link } from "react-router-dom";
import {Collapse} from 'react-bootstrap';
import {MenuList} from './Menu';

/// Menu


/// Scroll
// import PerfectScrollbar from "react-perfect-scrollbar";

import {useScrollPosition} from "@n8tb1t/use-scroll-position";
import { ThemeContext } from "../../../context/ThemeContext";

const reducer = (previousState, updatedState) => ({
  ...previousState,
  ...updatedState,
});

const initialState = {
  active : "",
  activeSubmenu : "",
}

const superAdminOnlyMenus = ["manage-admins", "manage-roles", "access-control", "activity-dashboard"];

// Map sidebar menu items to permission page_keys
const menuToPageKey = {
  'museum-entry': 'museum-entry',
  'museum-entries': 'museum-entries',
  'camping-management': 'camping-management',
  'booking': 'booking',
  'booking-list': 'booking-list',
};

const SideBar = () => {
  const {
    iconHover,
    sidebarposition,
    headerposition,
    sidebarLayout,
    ChangeIconSidebar,
  } = useContext(ThemeContext);
  const date = new Date();
  const role = localStorage.getItem("userRole");
  const isSuperAdmin = role === 'superadmin' || role === '1' || role === 1;
  const [heartBtn, setHeartBtn] = useState();
  const [state, setState] = useReducer(reducer, initialState);
  const [permKey, setPermKey] = useState(0);

  useEffect(() => {
    // Re-check permissions on mount and storage change
    const handleStorage = () => setPermKey(prev => prev + 1);
    window.addEventListener('storage', handleStorage);
    setPermKey(prev => prev + 1);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const visibleMenuList = useMemo(() => {
    const stored = localStorage.getItem('permissions');
    const perms = stored ? JSON.parse(stored) : null;

    return MenuList.map((menu) => {
      if (!menu.content) return menu;
      const filteredContent = menu.content.filter((item) => {
        // Super admin only items
        if (superAdminOnlyMenus.includes(item.to) && !isSuperAdmin) return false;
        // Permission based visibility for non-super admins
        if (!isSuperAdmin) {
          if (!perms || perms === 'SUPER_ADMIN') return true;
          const pageKey = menuToPageKey[item.to];
          if (pageKey) {
            const pagePerm = perms[pageKey];
            if (!pagePerm || pagePerm.can_view !== 1) return false;
          }
        }
        return true;
      });
      if (filteredContent.length === 0) return null;
      return { ...menu, content: filteredContent };
    }).filter(Boolean);
  }, [isSuperAdmin, permKey]);
  const handleMenuActive = status => {		
    setState({active : status});			
    if(state.active === status){				
      setState({active : ""});
    }   
  }
  const handleSubmenuActive = (status) => {		
    setState({activeSubmenu : status})
    if(state.activeSubmenu === status){
      setState({activeSubmenu : ""})			
    }    
  }

  //For scroll
  const [hideOnScroll, setHideOnScroll] = useState(true)
	useScrollPosition(
		({ prevPos, currPos }) => {
		  const isShow = currPos.y > prevPos.y
		  if (isShow !== hideOnScroll) setHideOnScroll(isShow)
		},
		[hideOnScroll]
	)
  
  
 // ForAction Menu
  let path = window.location.pathname;
  path = path.split("/");
  path = path[path.length - 1]; 

  useEffect(() => {
    visibleMenuList.forEach((data) => {
      data.content?.forEach((item) => {        
        if(path === item.to){         
          setState({active : data.title})          
        }
        item.content?.forEach(ele => {
          if(path === ele.to){
            setState({activeSubmenu : item.title, active : data.title})
          }
        })
      })
  })
  },[path, visibleMenuList]);
    

  return (
    <div
        onMouseEnter={()=>ChangeIconSidebar(true)}
        onMouseLeave={()=>ChangeIconSidebar(false)}
        className={`deznav ${iconHover} ${
        sidebarposition.value === "fixed" &&
        sidebarLayout.value === "horizontal" &&
        headerposition.value === "static"
          ? hideOnScroll > 120
            ? "fixed"
            : ""
          : ""
      }`}
    >
      <div className="deznav-scroll">
          <ul className="metismenu" id="menu">
            {visibleMenuList.map((data, index)=>{
                let menuClass = data.classsChange;
                  if(menuClass === "menu-title"){
                    return(
                        <li className={menuClass}  key={index} >{data.title}</li>
                    )
                  }else{
                    return(				
                      <li className={`has-menu ${ state.active === data.title ? 'mm-active' : ''}`}
                        key={index} 
                      >
                        
                        {data.content && data.content.length > 0 ?
                            <Link to={"#"} 
                              className="has-arrow ai-icon"
                              onClick={() => {handleMenuActive(data.title)}}
                            >								
                                {data.iconStyle}{" "}
                                <span className="nav-text">{data.title}</span>
                            </Link>
                        :
                          <Link  to={data.to} >
                              {data.iconStyle}{" "}
                              <span className="nav-text">{data.title}</span>
                          </Link>
                        }
                        <Collapse in={state.active === data.title ? true :false}>
                          <ul className={`${menuClass === "mm-collapse" ? "mm-show" : ""}`}>
                            {data.content && data.content.map((data,index) => {									
                              return(	
                                  <li key={index}
                                    className={`${ state.activeSubmenu === data.title ? "mm-active" : ""}`}                                    
                                  >
                                    {data.content && data.content.length > 0 ?
                                        <>
                                          <Link to={data.to} className={data.hasMenu ? 'has-arrow' : ''}
                                            onClick={() => { handleSubmenuActive(data.title)}}
                                          >
                                            {data.title}
                                          </Link>
                                          <Collapse in={state.activeSubmenu === data.title ? true :false}>
                                              <ul className={`${menuClass === "mm-collapse" ? "mm-show" : ""}`}>
                                                {data.content && data.content.map((data,index) => {
                                                  return(	                                                    
                                                    <li key={index}>
                                                      <Link className={`${path === data.to ? "mm-active" : ""}`} to={data.to}>{data.title}</Link>
                                                    </li>
                                                    
                                                  )
                                                })}
                                              </ul>
                                          </Collapse>
                                        </>
                                      :
                                      <Link to={data.to} 
                                          className={`${data.to === path ? 'mm-active' : ''}`}                                                
                                      >
                                        {data.title}
                                      </Link>
                                    }
                                    
                                  </li>
                                
                              )
                            })}
                          </ul>
                        </Collapse>
                      </li>	
                    )
                }
            })}  
          </ul>  
          <div className="copyright">
            <p> © {date.getFullYear()} All Rights Reserved</p>
            <p className="fs-12">Made with <span className={`heart ${heartBtn ? 'heart-blast' : ''}`}
              onClick={()=>setHeartBtn(!heartBtn)}
            ></span> by Appstrice</p>
          </div>
        </div>
    </div>
  );
};

export default SideBar;
