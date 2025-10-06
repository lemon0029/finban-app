"use client";

import {useEffect} from "react";
import {motion, useMotionValue, useTransform, animate} from "framer-motion";

interface AnimatedNumberProps {
    value: number;       // 外部传入的新值
    duration?: number;   // 动画时长（秒）
}

export default function AnimatedNumber({value, duration = 0.8}: AnimatedNumberProps) {
    const motionValue = useMotionValue(value);
    const displayValue = useTransform(motionValue, (latest) => latest.toFixed(2)); // 格式化

    useEffect(() => {
        const controls = animate(motionValue, value, {
            duration,
            ease: "easeOut",
        });
        return controls.stop;
    }, [value, duration, motionValue]);

    return <motion.span>{displayValue}</motion.span>;
}