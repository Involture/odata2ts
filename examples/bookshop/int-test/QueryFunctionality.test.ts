import { RequestError } from "@odata2ts/axios-odata-client";

import { BooksModel } from "../src/catalog/CatalogModel";
import { catalogService } from "./services";

describe("CAP V4 Integration Testing: Query Capabilities", () => {
  const testService = catalogService;

  const BOOK_ZERO: Omit<BooksModel, "image" | "createdAt" | "modifiedAt"> = {
    id: 201,
    title: "Wuthering Heights",
    descr:
      "Wuthering Heights, Emily Brontë's only novel, was published in 1847 under the pseudonym \"Ellis Bell\". It was written between October 1845 and June 1846. Wuthering Heights and Anne Brontë's Agnes Grey were accepted by publisher Thomas Newby before the success of their sister Charlotte's novel Jane Eyre. After Emily's death, Charlotte edited the manuscript of Wuthering Heights and arranged for the edited version to be published as a posthumous second edition in 1850.",
    author: "Emily Brontë",
    genreId: 11,
    stock: 12,
    price: 11.11,
    currencyCode: "GBP",
  };

  test("list books with count", async () => {
    const result = await testService.navToBooks().query((b) => b.count());
    expect(result.status).toBe(200);
    expect(result.data).toBeDefined();
    expect(result.data["@odata.count"]).toBe(5);

    expect(result.data.value).toBeDefined();
    expect(result.data.value.length).toBe(5);
    expect(result.data.value[0]).toMatchObject(BOOK_ZERO);
  });

  test("get book zero", async () => {
    const result = await testService.navToBooks().get(BOOK_ZERO.id).query();
    expect(result.status).toBe(200);
    expect(result.data).toBeDefined();

    const product: BooksModel = result.data;
    expect(product).toMatchObject(BOOK_ZERO);
  });

  test("get unknown book", async () => {
    let failMsg = "Not Found";
    await expect(() => testService.navToBooks().get(-1).query()).rejects.toThrow(failMsg);

    // again, but now inspect error in detail
    try {
      await testService.navToBooks().get(-1).query();
      // we expect an error and no success
      expect(1).toBe(2);
    } catch (error) {
      const e = error as RequestError;
      expect(e.isRequestError).toBeTruthy();
      expect(e.status).toBe(404);
      expect(e.message).toBe(failMsg);
      expect(e.data).toStrictEqual({
        error: {
          code: "404",
          message: failMsg,
        },
      });
    }
  });

  test("deep select query", async () => {
    const result = await testService.navToBooks().query((b, qBook) => {
      b.count()
        .select("id", "title", "stock", "price")
        .expanding("genre", (expBuilder) => {
          return expBuilder.select("name").expand("parent");
        })
        .filter(qBook.stock.gt(3))
        .orderBy(qBook.id.asc());
    });
    expect(result.status).toBe(200);
    expect(result.data.value).toBeDefined();

    const products: Array<Partial<BooksModel>> = result.data.value;
    expect(products[0]).toStrictEqual({
      id: 201,
      title: "Wuthering Heights",
      stock: 12,
      price: 11.11,
      genre: {
        id: 11,
        name: "Drama",
        parent: {
          id: 10,
          parentId: null,
          name: "Fiction",
          descr: null,
        },
      },
    });
  });

  /*

  test("function call", async () => {
    const result = await testService.getProductsByRating({ rating: 4 });

    expect(result.status).toBe(200);
    // no count query => no "results" object (bug in odata-service)
    // @ts-ignore
    expect(result.data.d[0]).toMatchObject(BOOK_ZERO);
  });



  test("create key and parse key", async () => {
    const expectedSimple = 333;
    const expectedComplex = { id: expectedSimple };

    // simple version
    let result = testService.navToProducts().createKey(expectedSimple);
    expect(result).toBe(`Products(${expectedSimple})`);
    expect(testService.navToProducts().parseKey(result)).toBe(expectedSimple);

    // complex version
    result = testService.navToProducts().createKey(expectedComplex);
    expect(result).toBe(`Products(ID=${expectedSimple})`);
    expect(testService.navToProducts().parseKey(result)).toStrictEqual(expectedComplex);
  });*/
});
