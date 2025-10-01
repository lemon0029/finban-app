"use client"

import {useEffect, useState} from "react";
import {ProductDTO} from "@/lib/types";
import {Product} from "@/app/products/product";
import {motion} from "framer-motion";
import {PlusCircle, Search} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";

async function fetchProducts() {
    const res = await fetch("http://localhost:8080/api/products", {credentials: "include"})
    return await res.json()
}

export default function ProductList() {

    const [searchTerm, setSearchTerm] = useState("")
    const [products, setProducts] = useState<ProductDTO[]>([])

    useEffect(() => {
        fetchProducts().then(data => setProducts(data))
    }, [])

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const motions = {
        container: {
            hidden: {opacity: 0},
            show: {
                opacity: 1,
                transition: {
                    staggerChildren: 0.1
                }
            }
        },
        item: {
            hidden: {y: 20, opacity: 0},
            show: {y: 0, opacity: 1}
        }
    }

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <h1 className="text-3xl font-bold">产品列表</h1>
                <div className="flex items-center w-full md:w-auto gap-2">
                    <div className="relative flex-1">
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                        <Input
                            placeholder="搜索产品名称或代码..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        // onClick={() => setIsSearchDialogOpen(true)}
                        className="relative overflow-hidden group whitespace-nowrap"
                        variant="outline"
                    >
                        <PlusCircle/>
                        添加产品
                    </Button>
                </div>
            </div>

            {
                products.length == 0 ? (
                    <div>
                        <p className="text-muted-foreground ml-1 mb-3">加载产品数据中...</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            <Skeleton className="h-35 w-full"/>
                            <Skeleton className="h-35 w-full"/>
                            <Skeleton className="h-35 w-full"/>
                            <Skeleton className="h-35 w-full"/>
                            <Skeleton className="h-35 w-full"/>
                        </div>
                    </div>
                ) : filteredProducts.length == 0 ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <p className="text-muted-foreground">没有找到匹配的产品</p>
                        </div>
                    </div>
                ) : (
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
                        variants={motions.container}
                        initial="hidden"
                        animate="show"
                    >
                        {
                            filteredProducts.map(product => (
                                <motion.div key={product.id} variants={motions.item} layout>
                                    <Product key={product.id} {...product} />
                                </motion.div>
                            ))
                        }
                    </motion.div>
                )
            }

            {
                filteredProducts.length > 0 && (
                    <div className="mt-10 text-right text-sm text-muted-foreground">
                        当前共有 {filteredProducts.length} 个产品
                    </div>
                )
            }
        </>
    )
}
