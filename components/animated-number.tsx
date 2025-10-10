"use client";
import {useEffect, useRef, useState} from "react";
import {animate, motion, useMotionValue, useTransform} from "framer-motion";
import clsx from "clsx";

interface AnimatedNumberProps {
    value: number;          // 外部传入的新值
    duration?: number;      // 数字缓动时长（秒）
    bgFlashEnabled?: boolean;        // 是否需要闪光动画
    bgFlashDuration?: number; // 闪光动画时长（秒）
}

export default function AnimatedNumber({
                                           value,
                                           duration = 0.8,
                                           bgFlashEnabled = false,
                                           bgFlashDuration = 0.4,
                                       }: AnimatedNumberProps) {
    const motionValue = useMotionValue(value);
    const displayValue = useTransform(motionValue, (latest) => latest.toFixed(2));
    const prevValue = useRef(value);
    const [animates, setAnimates] = useState({})

    const widthCh = `${value.toFixed(2).length}ch`

    useEffect(() => {
        let flashColor = null;
        // 判断涨跌
        if (value > prevValue.current) {
            flashColor = "green";
        } else if (value < prevValue.current) {
            flashColor = "red";
        }

        // 数字动画
        const controls = animate(motionValue, value, {
            duration,
            ease: "easeOut",
        });

        if (bgFlashEnabled) {
            setAnimates({
                backgroundColor: flashColor === "green" ?
                    "var(--color-profit-background)" :
                    flashColor === "red" ?
                        "var(--color-loss-background)" :
                        "rgba(0, 0, 0, 0)",
                color: flashColor === "green" ?
                    "var(--color-profit)" :
                    flashColor === "red" ?
                        "var(--color-loss)" :
                        "var(--color-text)"
            })
        }

        // 闪光动画自动清除
        const timer = setTimeout(() => {
            if (bgFlashEnabled) {
                setAnimates({
                    backgroundColor: "rgba(0, 0, 0, 0)",
                    color: "var(--color-text)"
                })
            }
        }, bgFlashDuration * 1000);

        prevValue.current = value;

        return () => {
            controls.stop();
            clearTimeout(timer);
        };
    }, [value, duration, bgFlashDuration, motionValue, bgFlashEnabled]);

    return (
        <motion.span
            style={{
                width: widthCh,
            }}
            animate={animates}
            transition={{
                duration: bgFlashDuration,
                ease: "easeOut",
            }}
            className={clsx(`${bgFlashEnabled ? "px-1" : ""} rounded-xs`)}
        >
            {displayValue}
        </motion.span>
    );
}
