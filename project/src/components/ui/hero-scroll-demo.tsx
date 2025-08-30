"use client";
import React from "react";
import { ContainerScroll } from "./container-scroll-animation";

export function HeroScrollDemo() { 
  return ( 
    <div className="flex flex-col overflow-hidden pb-[500px] pt-[1000px]"> 
      <ContainerScroll 
        titleComponent={ 
          <> 
            <h1 className="text-4xl font-semibold text-black dark:text-white"> 
              Unleash the power of <br /> 
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none"> Scroll Animations </span> 
            </h1> 
          </> 
        } > 
        <img 
          src="https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1400&h=720&fit=crop&crop=center" 
          alt="hero" 
          className="mx-auto rounded-2xl object-cover h-full object-left-top" 
          draggable={false} 
        /> 
      </ContainerScroll> 
    </div> 
  ); 
}
