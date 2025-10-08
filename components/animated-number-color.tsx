"use client";
import {useEffect, useRef, useState} from "react";
import {animate, motion, useMotionValue, useTransform} from "framer-motion";
import clsx from "clsx";

interface AnimatedNumberProps {
    value: number;        // 外部传入的新值
    duration?: number;    // 数字缓动时长（秒）
    flashDuration?: number; // 闪光动画时长（秒）
}

export default function AnimatedNumberColor({
                                                value,
                                                duration = 0.6,
                                                flashDuration = 0.3,
                                            }: AnimatedNumberProps) {
    const motionValue = useMotionValue(value);
    const displayValue = useTransform(motionValue, (latest) => latest.toFixed(2));
    const prevValue = useRef(value);
    const [flashColor, setFlashColor] = useState<"green" | "red" | null>(null);

    useEffect(() => {
        // 判断涨跌
        if (value > prevValue.current) {
            setFlashColor("green");
        } else if (value < prevValue.current) {
            setFlashColor("red");
        }

        // 数字动画
        const controls = animate(motionValue, value, {
            duration,
            ease: "easeOut",
        });

        // 闪光动画自动清除
        const timer = setTimeout(() => {
            setFlashColor(null);
        }, flashDuration * 1000);

        prevValue.current = value;

        return () => {
            controls.stop();
            clearTimeout(timer);
        };
    }, [value, duration, flashDuration, motionValue]);

    return (
        <motion.div
            animate={{
                backgroundColor: flashColor === "green" ?
                    "var(--color-profit-background)" :
                    flashColor === "red" ?
                        "var(--color-loss-background)" :
                        "rgba(0, 0, 0, 0)",
            }}
            transition={{
                duration: flashDuration,
                ease: "easeOut",
            }}
            className={clsx("px-1 rounded-xs")}
        >
            {displayValue}
        </motion.div>
    );
}
