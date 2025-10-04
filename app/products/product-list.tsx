"use client"

import React, {useEffect, useState} from "react";
import {ProductDTO} from "@/lib/types";
import {Product} from "@/app/products/product";
import {motion} from "framer-motion";
import {Activity, CheckIcon, Code, Plus, PlusCircle, Search, Tag} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {useMediaQuery} from "@/hooks/use-media-query";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from "@/components/ui/drawer";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Spinner} from "@/components/ui/spinner";
import {Empty, EmptyDescription, EmptyTitle} from "@/components/ui/empty";
import {Item, ItemActions, ItemContent, ItemFooter, ItemGroup, ItemSeparator, ItemTitle} from "@/components/ui/item";

async function fetchProducts() {
    const res = await fetch("http://localhost:8080/api/products", {credentials: "include"})
    return await res.json()
}

async function searchProducts(keyword: string) {
    const res = await fetch(`http://localhost:8080/api/products/search?keyword=${encodeURIComponent(keyword)}`, {credentials: "include"})
    return await res.json()
}

function AddProductDialog() {
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    const [searchResults, setSearchResults] = useState<{
        id: string
        name: string
        code: string
        fundType: string
        nav: number
    }[]>([])
    const [isSearching, setIsSearching] = useState(false)

    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())

    const handleSearch = () => {
        if (!searchTerm) return

        setIsSearching(true)

        searchProducts(searchTerm).then((data) => {
            setSearchResults(data.map((item: { [x: string]: never; }) => {
                const fundBaseInfo = item["unMappedProperties"]["FundBaseInfo"]
                return {
                    id: item["unMappedProperties"]["_id"],
                    name: item["NAME"],
                    code: item["CODE"],
                    fundType: fundBaseInfo["FTYPE"],
                    nav: fundBaseInfo["DWJZ"]
                }
            }))

            setIsSearching(false)
        })
    }

    const searchInputArea = (<div className="flex items-center gap-2">
            <Input
                name="externalSearch"
                placeholder="输入基金名称或代码搜索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
            />
            <Button disabled={isSearching} variant={"outline"} onClick={handleSearch}>
                {isSearching && <Spinner/>}搜索
            </Button>
        </div>
    );

    const productItems = (searchResults.map((item, index) => (
        <React.Fragment key={item.code}>
            <Item data-selected={`${selectedProducts.has(item.code)}`} key={item.code}
                  className={"py-3 px-1 rounded-none"}>
                <ItemContent>
                    <ItemTitle className={"mb-1"}>{item.name}</ItemTitle>
                    <ItemFooter className={"grid grid-cols-4"}>
                        <div className="flex justify-start items-center text-xs text-muted-foreground col-span-1">
                            <Code className="h-3 w-3 mr-1"/> {item.code}
                        </div>

                        <div className="flex justify-start items-center text-xs text-muted-foreground col-span-1">
                            <Activity className="h-3 w-3 mr-1"/> {item.nav}
                        </div>

                        <div className="flex justify-start items-center text-xs text-muted-foreground col-span-2">
                            <Tag className="h-3 w-3 mr-1"/> {item.fundType}
                        </div>
                    </ItemFooter>
                </ItemContent>
                <ItemActions>
                    <Button
                        size="icon-sm"
                        variant="outline"
                        className={`rounded-full ${selectedProducts.has(item.code) ? "bg-accent" : ""}`}
                        aria-label="Invite"
                        onClick={() => {
                            const newSet = new Set(selectedProducts)
                            const checked = newSet.has(item.code)
                            if (!checked) {
                                newSet.add(item.code)
                            } else {
                                newSet.delete(item.code)
                            }
                            setSelectedProducts(newSet)
                        }}
                    >
                        {
                            selectedProducts.has(item.code) ? (<CheckIcon/>) : <Plus/>
                        }
                    </Button>
                </ItemActions>
            </Item>

            {index !== searchResults.length - 1 && <ItemSeparator/>}
        </React.Fragment>
    )));

    const isDesktop = useMediaQuery("(min-width: 768px)")

    if (isDesktop) {
        return (<Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        className="relative overflow-hidden group whitespace-nowrap"
                        variant="outline"
                    >
                        <PlusCircle/>
                        添加产品
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[650px]">
                    <DialogHeader>
                        <DialogTitle>添加基金产品</DialogTitle>
                        <DialogDescription>
                            搜索第三方平台的基金产品并添加到您的列表中
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">

                        {searchInputArea}

                        {searchResults.length > 0 ? (
                            <ScrollArea className="h-100">
                                <ItemGroup>
                                    {productItems}
                                </ItemGroup>
                            </ScrollArea>
                        ) : (
                            <div className="flex justify-center items-center text-muted-foreground h-100">
                                未找到匹配的基金产品
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={selectedProducts.size == 0}>提交</Button>
                    </DialogFooter>

                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button
                    className="relative overflow-hidden group whitespace-nowrap"
                    variant="outline"
                >
                    <PlusCircle/>
                    添加产品
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle>添加基金产品</DrawerTitle>
                    <DrawerDescription>
                        搜索第三方平台的基金产品并添加到您的列表中
                    </DrawerDescription>
                </DrawerHeader>

                <div className="grid gap-4 px-4 h-2/3">

                    {searchInputArea}

                    {searchResults.length > 0 ? (
                        <ScrollArea className="h-120 overflow-y-auto pb-2">
                            <ItemGroup>
                                {productItems}
                            </ItemGroup>
                        </ScrollArea>
                    ) : (
                        <div className="flex justify-center items-center text-muted-foreground h-120">
                            未找到匹配的产品
                        </div>
                    )}
                </div>

                <DrawerFooter className="mb-0">
                    <DrawerClose asChild>
                        <Button type="submit" disabled={selectedProducts.size == 0}>提交</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-1 gap-4">
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
                    <AddProductDialog/>
                </div>
            </div>

            {
                products.length == 0 && (
                    <div>
                        <p className="text-muted-foreground ml-1 mb-3">加载产品数据中...</p>
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-20 w-full"/>
                            <Skeleton className="h-20 w-full"/>
                            <Skeleton className="h-20 w-2/3"/>
                        </div>
                    </div>
                )
            }

            {
                filteredProducts.length > 0 && (
                    <div className="text-right text-sm text-muted-foreground">
                        当前共有 {filteredProducts.length} 个产品
                    </div>
                )
            }

            {
                filteredProducts.length == 0 ? (
                    <Empty>
                        <EmptyTitle>No data</EmptyTitle>
                        <EmptyDescription>No products found, try adjusting your search or add new
                            products.</EmptyDescription>
                    </Empty>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 xl:grid-cols-3 gap-3"
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
        </>
    )
}
