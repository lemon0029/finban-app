"use client"

import {useEffect, useState} from "react";
import {ProductDTO} from "@/lib/types";
import {Product} from "@/app/products/product";
import {motion} from "framer-motion";
import {PlusCircle, Search} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {Checkbox} from "@/components/ui/checkbox";

async function fetchProducts() {
    const res = await fetch("http://localhost:8080/api/products", {credentials: "include"})
    return await res.json()
}

async function searchProducts(keyword: string) {
    const res = await fetch(`http://localhost:8080/api/products/search?keyword=${encodeURIComponent(keyword)}`, {credentials: "include"})
    return await res.json()
}

export default function ProductList() {

    const [searchTerm, setSearchTerm] = useState("")
    const [products, setProducts] = useState<ProductDTO[]>([])

    const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false)
    const [externalSearchTerm, setExternalSearchTerm] = useState("")
    const [searchResults, setSearchResults] = useState<{
        id: string
        name: string
        code: string
    }[]>([])
    const [isSearching, setIsSearching] = useState(false)

    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())

    useEffect(() => {
        fetchProducts().then(data => setProducts(data))
    }, [])

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleSearchExternal = () => {
        if (!externalSearchTerm) return

        setIsSearching(true)

        searchProducts(externalSearchTerm).then((data) => {
            setSearchResults(data.map((item: { [x: string]: never; }) => {
                return {
                    id: item["unMappedProperties"]["_id"],
                    name: item["NAME"],
                    code: item["CODE"]
                }
            }))

            setIsSearching(false)
        })

    }

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
                        onClick={() => setIsSearchDialogOpen(true)}
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

            <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>添加基金产品</DialogTitle>
                        <DialogDescription>
                            搜索第三方平台的基金产品并添加到您的列表中
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex items-center gap-2">
                            <Input
                                name="externalSearch"
                                placeholder="输入基金名称或代码搜索..."
                                value={externalSearchTerm}
                                onChange={(e) => setExternalSearchTerm(e.target.value)}
                                className="flex-1"
                            />
                            <Button disabled={isSearching}
                                    variant={"outline"}
                                    onClick={handleSearchExternal}
                            >
                                {isSearching ? "搜索中..." : "搜索"}
                            </Button>
                        </div>

                        {searchResults.length > 0 ? (
                            <div className="border rounded-md overflow-hidden">
                                <div className="grid grid-cols-9 bg-muted px-4 py-2 text-sm font-medium">
                                    <div className="col-span-1"></div>
                                    <div className="col-span-2">代码</div>
                                    <div className="col-span-6">名称</div>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {searchResults.map((result) => (
                                        <div key={result.code}
                                             className="grid grid-cols-9 px-4 py-3 border-t hover:bg-muted/50">
                                            <div className="col-span-1">
                                                <Checkbox id={result.code} onCheckedChange={(checked) => {
                                                    const newSet = new Set(selectedProducts)
                                                    if (checked) {
                                                        newSet.add(result.code)
                                                    } else {
                                                        newSet.delete(result.code)
                                                    }

                                                    console.log(newSet)
                                                    setSelectedProducts(newSet)
                                                }}/>
                                            </div>
                                            <div className="col-span-2 text-muted-foreground">{result.code}</div>
                                            <div className="col-span-6 font-medium truncate">{result.name}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : externalSearchTerm && !isSearching ? (
                            <div className="flex justify-center items-center text-muted-foreground h-72">
                                未找到匹配的基金产品
                            </div>
                        ) : null}
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={selectedProducts.size == 0}>提交</Button>
                    </DialogFooter>

                </DialogContent>
            </Dialog>
        </>
    )
}
