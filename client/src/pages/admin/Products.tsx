import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { Package, Plus, Edit, Trash2 } from "lucide-react";

export default function Products() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
            <Package className="h-8 w-8" />
            Products Management
          </h1>
          <p className="text-gray-400 mt-2">Manage shop products and inventory</p>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-500">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-cyan-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-cyan-400">142</div>
            <p className="text-gray-400">Total Products</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-cyan-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-400">89</div>
            <p className="text-gray-400">In Stock</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-cyan-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-yellow-400">24</div>
            <p className="text-gray-400">Low Stock</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-cyan-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-red-400">15</div>
            <p className="text-gray-400">Out of Stock</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900 border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-cyan-400">Product Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-cyan-500/20">
                <TableHead>Product</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-cyan-500/10">
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                  No products found
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
